import { ChatMessage, HealthInfo, ModelOption, StreamChunkPayload, ApiErrorResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface StreamCallbacks {
  onThinkingChunk: (chunk: string) => void;
  onContentChunk: (chunk: string) => void;
  onDone: (conversationId?: string, model?: string) => void;
  onError: (errorMsg: string) => void;
}

export const apiService = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async getHealth(): Promise<HealthInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Health check failed with HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return {
        status: 'DOWN',
        application: 'DeepSpring AI',
        version: '1.0.0',
        aiProvider: 'unknown',
        configuredModel: 'unavailable',
        ollamaBaseUrl: 'http://localhost:11434',
        timestamp: new Date().toISOString(),
        details: { error: msg }
      };
    }
  },

  async getModels(): Promise<ModelOption[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.warn('Could not fetch models list from backend, using default fallback', e);
      return [
        {
          id: 'deepseek-r1',
          name: 'DeepSeek R1',
          description: 'Default local DeepSeek reasoning model',
          supportsThinking: true,
          isDefault: true
        }
      ];
    }
  },

  async sendChatSync(
    prompt: string,
    conversationId?: string,
    model?: string
  ): Promise<{ message: string; reasoningContent?: string; conversationId: string; model: string }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt, conversationId, model })
    });

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}`;
      try {
        const errorJson: ApiErrorResponse = await response.json();
        if (errorJson.message) {
          errorMsg = errorJson.message;
        }
      } catch {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  },

  async streamChat(
    prompt: string,
    conversationId: string | undefined,
    model: string | undefined,
    callbacks: StreamCallbacks,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ prompt, conversationId, model }),
      signal: abortSignal
    });

    if (!response.ok) {
      let errorMsg = `Unable to stream response (HTTP ${response.status})`;
      try {
        const errorJson: ApiErrorResponse = await response.json();
        if (errorJson.message) {
          errorMsg = errorJson.message;
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser or response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr) continue;

            try {
              const payload: StreamChunkPayload = JSON.parse(dataStr);
              if (payload.error) {
                callbacks.onError(payload.error);
                return;
              }
              if (payload.thinkingChunk) {
                callbacks.onThinkingChunk(payload.thinkingChunk);
              }
              if (payload.content) {
                callbacks.onContentChunk(payload.content);
              }
              if (payload.isDone) {
                callbacks.onDone(payload.conversationId, payload.model);
              }
            } catch {
              // Raw non-JSON text chunk fallback
              callbacks.onContentChunk(dataStr);
            }
          }
        }
      }

      // Flush remainder
      if (buffer.trim().startsWith('data:')) {
        const dataStr = buffer.trim().slice(5).trim();
        try {
          const payload: StreamChunkPayload = JSON.parse(dataStr);
          if (payload.content) callbacks.onContentChunk(payload.content);
        } catch {
          // ignore
        }
      }

      callbacks.onDone(conversationId, model);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Stream aborted by user via Stop Generation button
        callbacks.onDone(conversationId, model);
        return;
      }
      const msg = err instanceof Error ? err.message : 'Streaming failed';
      callbacks.onError(msg);
      throw err;
    }
  }
};
