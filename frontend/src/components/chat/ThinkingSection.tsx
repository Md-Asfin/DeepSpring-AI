import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BrainCircuit, Sparkles } from 'lucide-react';

interface ThinkingSectionProps {
  thinking: string;
  isStreaming?: boolean;
}

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({ thinking, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!thinking || thinking.trim().length === 0) return null;

  return (
    <div className="my-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden transition-all duration-200">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          )}
          <span className="font-semibold tracking-wide">
            {isStreaming ? 'DeepSeek Thinking...' : 'DeepSeek Reasoning Process'}
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-200/70 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200">
            {thinking.length} chars
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span className="text-[11px]">{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-indigo-100 dark:border-indigo-900/30 text-xs font-mono leading-relaxed text-indigo-950/80 dark:text-indigo-200/80 whitespace-pre-wrap bg-white/40 dark:bg-black/20">
          {thinking}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-500 animate-pulse align-middle" />
          )}
        </div>
      )}
    </div>
  );
};
