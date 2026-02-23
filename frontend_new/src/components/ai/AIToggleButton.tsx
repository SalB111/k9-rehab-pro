// components/ai/AIToggleButton.tsx — Floating action button to open AI panel

import React from 'react';

interface AIToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function AIToggleButton({ onClick, isOpen }: AIToggleButtonProps) {
  if (isOpen) return null;

  return (
    <button
      className="ai-toggle-btn"
      onClick={onClick}
      title="Open K9 Rehab AI"
      aria-label="Open AI Assistant"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v3a5 5 0 0 0 10 0v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
      <span className="ai-toggle-btn__label">AI</span>
    </button>
  );
}
