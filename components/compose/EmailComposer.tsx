'use client';

import { RichTextEditor } from './RichTextEditor';

interface EmailComposerProps {
  subject: string;
  body: string;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  activeField: 'subject' | 'body' | null;
  onFieldFocus: (field: 'subject' | 'body') => void;
  headers?: string[];
}

export function EmailComposer({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  activeField,
  onFieldFocus,
  headers = [],
}: EmailComposerProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-600">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          onFocus={() => onFieldFocus('subject')}
          placeholder="Hello @first_name, I wanted to reach out..."
          className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
            activeField === 'subject' ? 'border-green-500/50' : 'border-gray-200'
          }`}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-600">Body</label>
        <RichTextEditor
          value={body}
          onChange={onBodyChange}
          onFocus={() => onFieldFocus('body')}
          active={activeField === 'body'}
          headers={headers}
        />
      </div>
    </div>
  );
}
