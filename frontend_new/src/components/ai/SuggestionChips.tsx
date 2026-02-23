// components/ai/SuggestionChips.tsx — Context-aware quick action chips

import React from 'react';
import type { AISuggestion } from '../../types/ai';

interface SuggestionChipsProps {
  suggestions: AISuggestion[];
  onSelect: (prompt: string) => void;
  compact?: boolean;
}

export default function SuggestionChips({ suggestions, onSelect, compact = false }: SuggestionChipsProps) {
  if (!suggestions.length) return null;

  // Group by category
  const grouped = suggestions.reduce<Record<string, AISuggestion[]>>((acc, s) => {
    const cat = s.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (compact) {
    return (
      <div className="suggestion-chips suggestion-chips--compact">
        {suggestions.slice(0, 4).map((s, i) => (
          <button
            key={i}
            className="suggestion-chips__chip"
            onClick={() => onSelect(s.prompt)}
            title={s.prompt}
          >
            <span className="suggestion-chips__icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="suggestion-chips">
      <div className="suggestion-chips__title">How can I help?</div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="suggestion-chips__group">
          <div className="suggestion-chips__category">{category}</div>
          <div className="suggestion-chips__row">
            {items.map((s, i) => (
              <button
                key={i}
                className="suggestion-chips__chip"
                onClick={() => onSelect(s.prompt)}
                title={s.prompt}
              >
                <span className="suggestion-chips__icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
