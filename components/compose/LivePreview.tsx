'use client';

import { useEffect, useState } from 'react';

interface LivePreviewProps {
  subjectTemplate: string;
  bodyTemplate: string;
  firstRow: Record<string, string> | null;
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function LivePreview({ subjectTemplate, bodyTemplate, firstRow }: LivePreviewProps) {
  const [preview, setPreview] = useState<{ previewSubject: string; previewBody: string } | null>(null);
  const debouncedSubject = useDebounce(subjectTemplate, 400);
  const debouncedBody = useDebounce(bodyTemplate, 400);

  useEffect(() => {
    if (!firstRow || (!debouncedSubject && !debouncedBody)) {
      setPreview(null);
      return;
    }
    fetch('/api/emails/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectTemplate: debouncedSubject,
        bodyTemplate: debouncedBody,
        row: firstRow,
      }),
    })
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [debouncedSubject, debouncedBody, firstRow]);

  if (!firstRow) {
    return (
      <div className="h-full flex items-center justify-center text-white/20 text-sm">
        Load a sheet to see preview
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="h-full flex items-center justify-center text-white/20 text-sm">
        Type a subject or body to preview...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/40 uppercase tracking-wide">Preview (row 1)</div>
      <div className="bg-white/5 rounded-lg p-4 space-y-3">
        <div>
          <div className="text-[10px] text-white/30 mb-1">Subject</div>
          <div className="text-sm text-white font-medium">{preview.previewSubject || '(empty)'}</div>
        </div>
        <div className="border-t border-white/5" />
        <div>
          <div className="text-[10px] text-white/30 mb-1">Body</div>
          <div
            className="text-sm text-white/80 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: preview.previewBody || '<em>(empty)</em>' }}
          />
        </div>
      </div>
    </div>
  );
}
