// components/ai/ChatInput.tsx — Message input with auto-expand textarea

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  suggestions?: Array<{ label: string; prompt: string }>;
  onSuggestionClick?: (prompt: string) => void;
}

export default function ChatInput({
  onSend,
  disabled = false,
  isStreaming = false,
  onStop,
  placeholder = 'Ask about exercises, protocols, conditions...',
  suggestions,
  onSuggestionClick
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      {suggestions && suggestions.length > 0 && !value && (
        <div className="chat-input__suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="chat-input__suggestion-chip"
              onClick={() => onSuggestionClick ? onSuggestionClick(s.prompt) : onSend(s.prompt)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="chat-input__row">
        <textarea
          ref={textareaRef}
          className="chat-input__textarea"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <button
            className="chat-input__btn chat-input__btn--stop"
            onClick={onStop}
            title="Stop generating"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            className="chat-input__btn chat-input__btn--send"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            title="Send (Enter)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        )}
      </div>
      <div className="chat-input__hint">
        Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}
