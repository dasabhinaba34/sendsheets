'use client';

interface ColumnPickerProps {
  headers: string[];
  onInsert: (variable: string) => void;
}

export function ColumnPicker({ headers, onInsert }: ColumnPickerProps) {
  if (headers.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Available columns</label>
      <div className="flex flex-wrap gap-2">
        {headers.map((h) => (
          <button
            key={h}
            onClick={() => onInsert(`@${h}`)}
            className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full hover:bg-green-500/20 transition-colors font-mono"
          >
            @{h}
          </button>
        ))}
      </div>
    </div>
  );
}
