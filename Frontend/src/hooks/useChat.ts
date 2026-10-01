import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatSession, ModelOption } from '../types';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => storageService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => storageService.getActiveSessionId());
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeModel, setActiveModel] = useState<string>('deepseek-r1');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize or load active session
  useEffect(() => {
    storageService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    storageService.saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Load models on startup
  useEffect(() => {
    apiService.getModels().then((data) => {
      setModels(data);
      const defaultMod = data.find((m) => m.isDefault);
      if (defaultMod) {
        setActiveModel(defaultMod.id);
      }
    }).catch((e) => {
      console.warn('Error loading models:', e);
    });
  }, []);

  // Get active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Create a new session
  const createNewSession = useCallback((initialPrompt?: string): ChatSession => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = initialPrompt
      ? initialPrompt.slice(0, 30) + (initialPrompt.length > 30 ? '...' : '')
      : 'New Chat';

    const newSession: ChatSession = {
      id: newSessionId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: activeModel,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setStreamError(null);
    return newSession;
  }, [activeModel]);

  // Switch session
  const selectSession = useCallback((sessionId: string) => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    setActiveSessionId(sessionId);
    setStreamError(null);
  }, [isStreaming]);

  // Rename session
  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() || 'Untitled' } : s))
    );
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        const nextActive = filtered.length > 0 ? filtered[0].id : null;
        setActiveSessionId(nextActive);
      }
      return filtered;
    });
  }, [activeSessionId]);

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSessions([]);
    setActiveSessionId(null);
    storageService.clearAll();
  }, [isStreaming]);

  // Stop active generation
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Send message
  const sendMessage = useCallback(async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isStreaming) return;

    setStreamError(null);

    let session = currentSession;
    if (!session) {
      session = createNewSession(trimmed);
    } else if (session.messages.length === 0) {
      const newTitle = trimmed.slice(0, 30) + (trimmed.length > 30 ? '...' : '');
      renameSession(session.id, newTitle);
    }

    const sessionId = session.id;
    const userMessageId = `msg_user_${Date.now()}`;
    const assistantMessageId = `msg_ai_${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      reasoningContent: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Add user message & empty assistant placeholder to active session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await apiService.streamChat(
        trimmed,
        sessionId,
        activeModel,
        {
          onThinkingChunk: (chunk: string) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                const msgs = s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, reasoningContent: (m.reasoningContent || '') + chunk }
                    : m
                );
                return { ...s, messages: msgs };
              })
            );
          },
          onContentChunk: (chunk: string) => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                const msgs = s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: m.content + chunk }
                    : m
                );
                return { ...s, messages: msgs };
              })
            );
          },
          onDone: () => {
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                const msgs = s.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, isStreaming: false } : m
                );
                return { ...s, messages: msgs, updatedAt: Date.now() };
              })
            );
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
          onError: (errMsg: string) => {
            setStreamError(errMsg);
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== sessionId) return s;
                const msgs = s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: m.content || `⚠️ ${errMsg}`,
                        isStreaming: false,
                        error: true,
                      }
                    : m
                );
                return { ...s, messages: msgs };
              })
            );
            setIsStreaming(false);
            abortControllerRef.current = null;
          },
        },
        abortController.signal
      );
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // user aborted
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s;
            const msgs = s.messages.map((m) =>
              m.id === assistantMessageId ? { ...m, isStreaming: false } : m
            );
            return { ...s, messages: msgs };
          })
        );
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Communication error';
        setStreamError(errorMsg);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s;
            const msgs = s.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: m.content || `⚠️ Unable to connect to the DeepSpring AI backend. Make sure the backend is running. (${errorMsg})`,
                    isStreaming: false,
                    error: true,
                  }
                : m
            );
            return { ...s, messages: msgs };
          })
        );
      }
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [currentSession, isStreaming, activeModel, createNewSession, renameSession]);

  return {
    sessions,
    currentSession,
    activeSessionId,
    isStreaming,
    activeModel,
    models,
    streamError,
    setActiveModel,
    sendMessage,
    stopGeneration,
    createNewSession,
    selectSession,
    renameSession,
    deleteSession,
    clearAllSessions,
    setStreamError,
  };
}
