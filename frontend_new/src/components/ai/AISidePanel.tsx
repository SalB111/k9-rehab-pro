// components/ai/AISidePanel.tsx — Slide-out AI chat panel

import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestionChips from './SuggestionChips';
import { useAIChat } from '../../hooks/useAIChat';
import type { AISuggestion } from '../../types/ai';
import './ai-panel.css';

interface AISidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISidePanel({ isOpen, onClose }: AISidePanelProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    send,
    stopStreaming,
    clearError,
    activeConversation,
    startNewChat
  } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const defaultSuggestions: AISuggestion[] = [
    { label: 'TPLO Protocol', prompt: 'Create a post-TPLO rehabilitation protocol for a 3-year-old Labrador', icon: '📋', category: 'Protocols' },
    { label: 'Exercise Search', prompt: 'What are the best passive ROM exercises for early CCL recovery?', icon: '🔍', category: 'Exercises' },
    { label: 'Safety Check', prompt: 'What are the contraindications for underwater treadmill therapy?', icon: '⚠️', category: 'Safety' },
    { label: 'Storyboard', prompt: 'Generate a storyboard for PROM_STIFLE exercise', icon: '🎬', category: 'Storyboards' }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="ai-overlay" onClick={onClose} />}

      {/* Panel */}
      <div className={`ai-panel ${isOpen ? 'ai-panel--open' : ''}`}>
        {/* Header */}
        <div className="ai-panel__header">
          <div className="ai-panel__header-left">
            <div className="ai-panel__logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="ai-panel__title">K9 Rehab AI</div>
              <div className="ai-panel__subtitle">Veterinary Rehabilitation Assistant</div>
            </div>
          </div>
          <div className="ai-panel__header-actions">
            <button
              className="ai-panel__header-btn"
              onClick={() => startNewChat()}
              title="New conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button className="ai-panel__header-btn" onClick={onClose} title="Close (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-panel__messages">
          {messages.length === 0 && !isLoading && (
            <div className="ai-panel__welcome">
              <div className="ai-panel__welcome-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="9" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3>K9 Rehab Pro AI</h3>
              <p>Your clinical rehabilitation assistant. Ask about exercises, protocols, conditions, or generate storyboards.</p>
              <SuggestionChips
                suggestions={defaultSuggestions}
                onSelect={(prompt) => send(prompt)}
              />
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {error && (
            <div className="ai-panel__error">
              <span>{error}</span>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={(msg) => send(msg)}
          disabled={isLoading}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </div>
    </>
  );
}
