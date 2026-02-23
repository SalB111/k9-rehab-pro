// pages/ai.tsx — Full-page AI chat interface

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatMessage from '../components/ai/ChatMessage';
import ChatInput from '../components/ai/ChatInput';
import ConversationList from '../components/ai/ConversationList';
import SuggestionChips from '../components/ai/SuggestionChips';
import { useAIChat } from '../hooks/useAIChat';
import type { AISuggestion } from '../types/ai';
import '../components/ai/ai-panel.css';
import './ai.css';

export default function AIPage() {
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    send,
    stopStreaming,
    clearError,
    loadConversations,
    startNewChat,
    selectConversation,
    removeConversation
  } = useAIChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const defaultSuggestions: AISuggestion[] = [
    { label: 'Post-TPLO Protocol', prompt: 'Create a post-TPLO rehabilitation protocol for a 3-year-old Labrador Retriever', icon: '📋', category: 'Protocols' },
    { label: 'IVDD Recovery Plan', prompt: 'What exercises are safe for a dog recovering from IVDD surgery?', icon: '🦴', category: 'Protocols' },
    { label: 'Exercise Search', prompt: 'Find passive ROM exercises suitable for early post-surgical recovery', icon: '🔍', category: 'Exercises' },
    { label: 'Hydrotherapy Guide', prompt: 'When is it safe to start underwater treadmill therapy after TPLO?', icon: '🏊', category: 'Exercises' },
    { label: 'Safety Check', prompt: 'What are the red flags to watch for during canine rehabilitation?', icon: '⚠️', category: 'Safety' },
    { label: 'Contraindications', prompt: 'List contraindications for therapeutic ultrasound in canine patients', icon: '🚫', category: 'Safety' },
    { label: 'Generate Storyboard', prompt: 'Generate a clinical storyboard for the PROM_STIFLE exercise', icon: '🎬', category: 'Storyboards' },
    { label: 'Geriatric Rehab', prompt: 'Design a gentle rehabilitation program for a 12-year-old dog with osteoarthritis', icon: '🐕', category: 'Protocols' }
  ];

  return (
    <div className="ai-page">
      {/* Navigation */}
      <div className="ai-page__nav">
        <Link to="/" className="ai-page__nav-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="ai-page__nav-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
          K9 Rehab AI
        </div>
        <button
          className="ai-page__sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      <div className="ai-page__body">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="ai-page__sidebar">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={selectConversation}
              onDelete={removeConversation}
              onNew={() => startNewChat()}
            />
          </div>
        )}

        {/* Main chat */}
        <div className="ai-page__main">
          <div className="ai-page__messages">
            {messages.length === 0 && !isLoading && (
              <div className="ai-page__welcome">
                <div className="ai-page__welcome-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
                    <circle cx="9" cy="9" r="1" fill="currentColor" />
                    <circle cx="15" cy="9" r="1" fill="currentColor" />
                  </svg>
                </div>
                <h2>K9 Rehab Pro AI Assistant</h2>
                <p>
                  Your clinical rehabilitation intelligence. Evidence-based exercise recommendations,
                  protocol generation, safety validation, and storyboard creation.
                </p>
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

          <div className="ai-page__input-area">
            <ChatInput
              onSend={(msg) => send(msg)}
              disabled={isLoading}
              isStreaming={isStreaming}
              onStop={stopStreaming}
              placeholder="Ask about exercises, protocols, rehabilitation strategies..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
