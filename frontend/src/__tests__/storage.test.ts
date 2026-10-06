import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storage';
import { ChatSession } from '../types';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no sessions stored', () => {
    const sessions = storageService.getSessions();
    expect(sessions).toEqual([]);
  });

  it('should save and load sessions properly', () => {
    const mockSessions: ChatSession[] = [
      {
        id: 'session-1',
        title: 'Test Session',
        messages: [
          {
            id: 'm1',
            role: 'user',
            content: 'Hello',
            timestamp: 1000,
          },
        ],
        createdAt: 1000,
        updatedAt: 1000,
        model: 'deepseek-r1',
      },
    ];

    storageService.saveSessions(mockSessions);
    const loaded = storageService.getSessions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Test Session');
    expect(loaded[0].messages[0].content).toBe('Hello');
  });

  it('should save and load active session id', () => {
    expect(storageService.getActiveSessionId()).toBeNull();
    storageService.saveActiveSessionId('session-123');
    expect(storageService.getActiveSessionId()).toBe('session-123');
  });

  it('should save and load theme mode', () => {
    expect(storageService.getTheme()).toBe('dark');
    storageService.saveTheme('light');
    expect(storageService.getTheme()).toBe('light');
  });
});
