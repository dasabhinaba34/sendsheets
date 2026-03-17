'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SheetLoader } from '@/components/sheets/SheetLoader';
import { ColumnPicker } from '@/components/sheets/ColumnPicker';
import { EmailComposer } from '@/components/compose/EmailComposer';
import { LivePreview } from '@/components/compose/LivePreview';
import { SendControls } from '@/components/compose/SendControls';

interface SheetState {
  sheetId: string;
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  sheetUrl: string;
}

export function ComposeContent() {
  const router = useRouter();
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientColumn, setRecipientColumn] = useState('');
  const [activeField, setActiveField] = useState<'subject' | 'body' | null>(null);
  const [trackOpens, setTrackOpens] = useState(false);

  function handleSheetLoad(data: { sheetId: string; headers: string[]; rows: Record<string, string>[]; rowCount: number }, url: string) {
    setSheet({ ...data, sheetUrl: url });
    if (data.headers.length > 0 && !recipientColumn) {
      const emailCol = data.headers.find((h) => h.toLowerCase().includes('email'));
      if (emailCol) setRecipientColumn(emailCol);
    }
  }

  function insertVariable(variable: string) {
    if (activeField === 'subject') {
      setSubject((s) => s + variable);
    } else {
      setBody((b) => b + variable);
    }
  }

  async function handleSend(trackOpensValue: boolean) {
    if (!sheet) throw new Error('No sheet loaded');
    if (!recipientColumn) throw new Error('Select a recipient column');

    const res = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId: sheet.sheetId,
        subjectTemplate: subject,
        bodyTemplate: body,
        recipientColumn,
        rows: sheet.rows,
        trackOpens: trackOpensValue,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Send failed');
    // Navigate immediately — campaign page shows live progress
    router.push(`/sent/${data.campaignId}`);
  }

  async function handleSaveDraft() {
    if (!sheet) throw new Error('No sheet loaded');

    const res = await fetch('/api/emails/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetUrl: sheet.sheetUrl,
        sheetId: sheet.sheetId,
        subjectTemplate: subject,
        bodyTemplate: body,
        recipientColumn,
        rowCount: sheet.rowCount,
      }),
    });
    if (!res.ok) throw new Error('Failed to save draft');
  }

  const disabled = !sheet || !subject || !body || !recipientColumn;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compose Campaign</h1>
        <p className="text-gray-500 text-sm mt-1">Load a sheet, write your email, send to everyone</p>
      </div>

      <SheetLoader onLoad={handleSheetLoad} />

      {sheet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">Rows loaded</span>
            <span className="text-lg font-bold text-green-400">{sheet.rowCount}</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="text-xs text-gray-500 block mb-1.5">Recipient column (email)</label>
            <select
              value={recipientColumn}
              onChange={(e) => setRecipientColumn(e.target.value)}
              className="w-full bg-transparent text-gray-900 text-sm focus:outline-none"
            >
              <option value="">Select column...</option>
              {sheet.headers.map((h) => (
                <option key={h} value={h} className="bg-white">{h}</option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">Columns</span>
            <span className="text-lg font-bold text-gray-600">{sheet.headers.length}</span>
          </div>
        </div>
      )}

      {sheet && <ColumnPicker headers={sheet.headers} onInsert={insertVariable} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <EmailComposer
            subject={subject}
            body={body}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
            activeField={activeField}
            onFieldFocus={setActiveField}
            headers={sheet?.headers ?? []}
          />
          <SendControls
            onSend={handleSend}
            onSaveDraft={handleSaveDraft}
            rowCount={sheet?.rowCount ?? 0}
            recipientColumn={recipientColumn}
            disabled={disabled}
            trackOpens={trackOpens}
            onTrackOpensChange={setTrackOpens}
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 min-h-64">
          <LivePreview
            subjectTemplate={subject}
            bodyTemplate={body}
            firstRow={sheet?.rows[0] ?? null}
          />
        </div>
      </div>
    </div>
  );
}
