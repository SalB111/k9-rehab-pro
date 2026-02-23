// components/ai/ConversationList.tsx — Sidebar conversation history

import React from 'react';
import type { AIConversation } from '../../types/ai';

interface ConversationListProps {
  conversations: AIConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew
}: ConversationListProps) {
  return (
    <div className="conv-list">
      <button className="conv-list__new-btn" onClick={onNew}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Chat
      </button>

      <div className="conv-list__items">
        {conversations.length === 0 && (
          <div className="conv-list__empty">No conversations yet</div>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conv-list__item ${conv.id === activeId ? 'conv-list__item--active' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="conv-list__item-icon">
              <ContextIcon type={conv.context_type} />
            </div>
            <div className="conv-list__item-info">
              <div className="conv-list__item-title">{conv.title || 'Untitled'}</div>
              <div className="conv-list__item-meta">
                {formatRelativeTime(conv.updated_at)} · {conv.message_count || 0} msgs
              </div>
            </div>
            <button
              className="conv-list__item-delete"
              onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
              title="Delete conversation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextIcon({ type }: { type: string }) {
  switch (type) {
    case 'protocol':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case 'exercise':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    case 'storyboard':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
