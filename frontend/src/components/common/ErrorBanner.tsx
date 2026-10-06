import React from 'react';
import { AlertTriangle, X, Terminal, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  const isOllamaError =
    error.toLowerCase().includes('ollama') || error.toLowerCase().includes('ai service is unavailable');
  const isBackendError =
    error.toLowerCase().includes('connect') ||
    error.toLowerCase().includes('backend') ||
    error.toLowerCase().includes('fetch');

  return (
    <div className="mx-4 sm:mx-6 my-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm text-xs sm:text-sm text-amber-900 dark:text-amber-200 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-950 dark:text-amber-100">
              {isOllamaError
                ? 'Local Ollama Service Unavailable'
                : isBackendError
                ? 'Backend Connection Issue'
                : 'Request Error'}
            </div>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">{error}</p>

            {isOllamaError && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-100/70 dark:bg-black/30 font-mono text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1 font-sans font-medium text-amber-900 dark:text-amber-200">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Manual Ollama Setup Steps:</span>
                </div>
                <div>1. Start Ollama: <code className="bg-amber-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">ollama serve</code></div>
                <div>2. Pull model: <code className="bg-amber-200/80 dark:bg-slate-800 px-1 py-0.5 rounded">ollama pull deepseek-r1</code></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors"
              title="Retry connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
