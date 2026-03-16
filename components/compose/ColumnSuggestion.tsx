'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SuggestionItem {
  label: string;
}

export interface SuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface Props {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
}

export const ColumnSuggestionList = forwardRef<SuggestionListRef, Props>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);

    // Keep refs so the imperative handle always reads current values
    const selectedRef = useRef(selected);
    const itemsRef = useRef(items);
    const commandRef = useRef(command);

    useEffect(() => { selectedRef.current = selected; }, [selected]);
    useEffect(() => { itemsRef.current = items; setSelected(0); }, [items]);
    useEffect(() => { commandRef.current = command; }, [command]);

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
          setSelected((s) => {
            const next = (s - 1 + itemsRef.current.length) % itemsRef.current.length;
            selectedRef.current = next;
            return next;
          });
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelected((s) => {
            const next = (s + 1) % itemsRef.current.length;
            selectedRef.current = next;
            return next;
          });
          return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          const item = itemsRef.current[selectedRef.current];
          if (item) commandRef.current(item);
          return true;
        }
        return false;
      },
    }), []); // stable ref — no deps needed

    if (items.length === 0) return null;

    return (
      <div className="bg-[#1a1a2e] border border-white/15 rounded-lg shadow-xl overflow-hidden py-1 min-w-[160px]">
        {items.map((item, i) => (
          <button
            key={item.label}
            onMouseDown={(e) => { e.preventDefault(); command(item); }}
            className={`w-full text-left px-3 py-1.5 text-sm font-mono transition-colors ${
              i === selected
                ? 'bg-green-500/20 text-green-300'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            @{item.label}
          </button>
        ))}
      </div>
    );
  }
);

ColumnSuggestionList.displayName = 'ColumnSuggestionList';
