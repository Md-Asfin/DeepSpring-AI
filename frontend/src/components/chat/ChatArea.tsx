import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ShieldCheck, Cpu, Lock, Sparkles, ArrowDown } from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSelectPrompt: (prompt: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Explain DeepSeek Reasoning',
    desc: 'How does DeepSeek R1 show its thinking process?',
    prompt: 'Explain how DeepSeek R1 performs chain-of-thought reasoning and how it differs from traditional models.',
    icon: Sparkles,
  },
  {
    title: 'Java Stream Processing',
    desc: 'Write clean modern Java stream code',
    prompt: 'Write a modern Java example demonstrating functional stream processing with error handling.',
    icon: Cpu,
  },
  {
    title: 'Why Run AI Locally?',
    desc: 'Privacy and performance benefits',
    prompt: 'What are the main privacy and architectural benefits of running Ollama and DeepSeek locally vs cloud APIs?',
    icon: ShieldCheck,
  },
  {
    title: 'Spring AI Architecture',
    desc: 'How Spring Boot integrates with Ollama',
    prompt: 'Explain the architecture behind Spring AI Ollama integration and reactive streaming.',
    icon: Lock,
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isStreaming, onSelectPrompt }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isNearBottom);
    setUserScrolledUp(!isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUserScrolledUp(false);
  };

  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, userScrolledUp]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-2 sm:px-6 py-6 scroll-smooth"
    >
      {messages.length === 0 ? (
        /* Empty State */
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
          {/* Logo Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-blue-500/10">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            DeepSpring AI
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mb-8">
            Private AI chat, running on your own machine.
          </p>

          {/* Quick Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
            {SAMPLE_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 transition-all duration-200 shadow-sm hover:shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-xl bg-blue-100/70 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Messages List */
        <div className="max-w-4xl mx-auto flex flex-col">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      )}

      {/* Floating Scroll To Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 sm:right-10 z-20 p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center animate-fade-in"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
