// components/ai/ChatMessage.tsx — Single message bubble for Vet AI chat

import React from 'react';
import type { AIMessage } from '../../types/ai';

interface ChatMessageProps {
  message: AIMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = (message as AIMessage & { isStreaming?: boolean }).isStreaming;

  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--assistant'}`}>
      <div className="chat-msg__avatar">
        {isUser ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="chat-msg__body">
        <div className="chat-msg__label">
          {isUser ? 'You' : 'K9 Rehab AI'}
          {isStreaming && <span className="chat-msg__streaming-dot" />}
        </div>
        <div className="chat-msg__content">
          <MessageContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

// Simple markdown-like rendering without external dependencies
function MessageContent({ content }: { content: string }) {
  if (!content) return <span className="chat-msg__typing">Thinking...</span>;

  // Split into paragraphs and render with basic formatting
  const paragraphs = content.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((para, i) => {
        // Code blocks
        if (para.startsWith('```')) {
          const lines = para.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const code = lines.slice(1).filter(l => l !== '```').join('\n');
          return (
            <pre key={i} className="chat-msg__code-block">
              {lang && <span className="chat-msg__code-lang">{lang}</span>}
              <code>{code}</code>
            </pre>
          );
        }

        // Headers
        if (para.startsWith('### ')) return <h4 key={i} className="chat-msg__h4">{para.slice(4)}</h4>;
        if (para.startsWith('## ')) return <h3 key={i} className="chat-msg__h3">{para.slice(3)}</h3>;
        if (para.startsWith('# ')) return <h2 key={i} className="chat-msg__h2">{para.slice(2)}</h2>;

        // Lists
        const lines = para.split('\n');
        if (lines.every(l => l.match(/^[-*]\s/) || l.trim() === '')) {
          return (
            <ul key={i} className="chat-msg__list">
              {lines.filter(l => l.match(/^[-*]\s/)).map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^[-*]\s/, ''))}</li>
              ))}
            </ul>
          );
        }

        // Numbered lists
        if (lines.every(l => l.match(/^\d+\.\s/) || l.trim() === '')) {
          return (
            <ol key={i} className="chat-msg__list">
              {lines.filter(l => l.match(/^\d+\.\s/)).map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          );
        }

        // Regular paragraph
        return <p key={i}>{renderInline(para.replace(/\n/g, ' '))}</p>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Inline code
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return <code key={`${i}-${j}`} className="chat-msg__inline-code">{cp.slice(1, -1)}</code>;
      }
      return <React.Fragment key={`${i}-${j}`}>{cp}</React.Fragment>;
    });
  });
}
