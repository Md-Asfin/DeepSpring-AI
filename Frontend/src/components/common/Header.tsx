import React from 'react';
import { Menu, Sun, Moon, Sparkles, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthInfo, ModelOption, ThemeMode } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  health: HealthInfo | null;
  models: ModelOption[];
  activeModel: string;
  onSelectModel: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  theme,
  onToggleTheme,
  health,
  models,
  activeModel,
  onSelectModel,
}) => {
  const isHealthy = health?.status === 'UP';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Left side: Hamburger (mobile) + Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                DeepSpring AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
              Private AI chat, running on your own machine.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Model select, Backend Health, Theme Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Model Selector dropdown */}
        <div className="relative">
          <select
            value={activeModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="appearance-none bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs font-medium py-1.5 pl-3 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer hover:border-blue-500 transition-colors"
            title="Select AI model"
            aria-label="Select AI model"
          >
            {models.length > 0 ? (
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))
            ) : (
              <option value="deepseek-r1">DeepSeek R1</option>
            )}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Backend health status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isHealthy
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
          title={
            isHealthy
              ? `Backend Connected (Provider: ${health?.aiProvider || 'active'})`
              : 'Backend Offline or Checking Connection'
          }
        >
          {isHealthy ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">
                {health?.aiProvider === 'mock' ? 'Mock AI' : 'Ollama Live'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Offline</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
