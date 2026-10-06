import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { ThinkingSection } from './ThinkingSection';
import { User, Sparkles, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex gap-3.5 my-4 px-3 sm:px-4 py-3 rounded-2xl transition-all duration-150 ${
        isUser
          ? 'flex-row-reverse self-end max-w-[85%] sm:max-w-[75%]'
          : 'flex-row self-start max-w-[96%] sm:max-w-[90%]'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
      </div>

      {/* Bubble Container */}
      <div
        className={`relative flex flex-col rounded-2xl p-4 sm:p-5 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
        }`}
      >
        {/* Role & Timestamp Header */}
        <div className="flex items-center justify-between gap-4 mb-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className={`font-semibold ${isUser ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isUser ? 'You' : 'DeepSpring AI'}
          </span>
          <div className="flex items-center gap-2">
            <span className={isUser ? 'text-blue-200 text-[11px]' : 'text-slate-400 text-[11px]'}>
              {formattedTime}
            </span>
            {!isUser && message.content && (
              <button
                onClick={handleCopyMessage}
                title="Copy entire response"
                aria-label="Copy entire response"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* DeepSeek Reasoning / Thinking block */}
        {!isUser && message.reasoningContent && (
          <ThinkingSection thinking={message.reasoningContent} isStreaming={message.isStreaming} />
        )}

        {/* Message Content */}
        {isUser ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed break-words text-white font-normal">
            {message.content}
          </div>
        ) : (
          <div className="min-w-0">
            {message.content ? (
              <MarkdownRenderer content={message.content} />
            ) : message.isStreaming ? (
              <div className="flex items-center gap-1.5 py-2 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
                <span className="text-xs ml-1 text-slate-500 font-mono">Generating response...</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Streaming Cursor indicator */}
        {!isUser && message.isStreaming && message.content && (
          <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
