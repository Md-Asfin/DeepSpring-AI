import React, { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import { Header } from './components/common/Header';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { Composer } from './components/chat/Composer';
import { ErrorBanner } from './components/common/ErrorBanner';
import { apiService } from './services/api';
import { HealthInfo } from './types';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthInfo | null>(null);

  const {
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
  } = useChat();

  const fetchHealth = async () => {
    try {
      const data = await apiService.getHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'DOWN',
        application: 'DeepSpring AI',
        version: '1.0.0',
        aiProvider: 'unknown',
        configuredModel: 'unavailable',
        ollamaBaseUrl: 'http://localhost:11434',
        timestamp: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeMessages = currentSession ? currentSession.messages : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={selectSession}
        onNewChat={() => createNewSession()}
        onRenameSession={renameSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
          health={health}
          models={models}
          activeModel={activeModel}
          onSelectModel={setActiveModel}
        />

        {/* Global Error Alert Banner */}
        <ErrorBanner
          error={streamError}
          onDismiss={() => setStreamError(null)}
          onRetry={fetchHealth}
        />

        {/* Messages Stream & Chat Area */}
        <ChatArea
          messages={activeMessages}
          isStreaming={isStreaming}
          onSelectPrompt={(prompt) => sendMessage(prompt)}
        />

        {/* Floating Message Composer */}
        <Composer
          onSend={(prompt) => sendMessage(prompt)}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
};

export default App;
