export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  reasoningContent?: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface HealthInfo {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  application: string;
  version: string;
  aiProvider: string;
  configuredModel: string;
  ollamaBaseUrl: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  supportsThinking: boolean;
  isDefault: boolean;
}

export interface StreamChunkPayload {
  content?: string;
  thinkingChunk?: string;
  isDone?: boolean;
  conversationId?: string;
  model?: string;
  error?: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
