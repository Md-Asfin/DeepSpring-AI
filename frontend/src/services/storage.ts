import { ChatSession, ThemeMode } from '../types';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'deepspring_schema_version',
  SESSIONS: 'deepspring_chat_sessions_v1',
  ACTIVE_SESSION_ID: 'deepspring_active_session_id_v1',
  THEME: 'deepspring_theme_mode',
};

const CURRENT_VERSION = '1.0';

export const storageService = {
  getSessions(): ChatSession[] {
    try {
      this.ensureSchema();
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sessions from localStorage:', e);
      return [];
    }
  },

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  },

  getActiveSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch {
      return null;
    }
  },

  saveActiveSessionId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      }
    } catch (e) {
      console.error('Failed to save active session ID:', e);
    }
  },

  getTheme(): ThemeMode {
    try {
      const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'dark';
    } catch {
      return 'dark';
    }
  },

  saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  },

  ensureSchema(): void {
    try {
      const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      if (!version) {
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_VERSION);
      }
    } catch {
      // ignore
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    } catch {
      // ignore
    }
  }
};
