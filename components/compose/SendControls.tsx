'use client';

import { useState } from 'react';
import { Send, Save, Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface SendControlsProps {
  onSend: (trackOpens: boolean) => Promise<void>;
  onSaveDraft: () => Promise<void>;
  rowCount: number;
  recipientColumn: string;
  disabled: boolean;
  trackOpens: boolean;
  onTrackOpensChange: (v: boolean) => void;
}

export function SendControls({
  onSend,
  onSaveDraft,
  rowCount,
  recipientColumn,
  disabled,
  trackOpens,
  onTrackOpensChange,
}: SendControlsProps) {
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      await onSend(trackOpens);
      setResult({ type: 'success', message: `Sent to ${rowCount} recipients` });
    } catch (err: unknown) {
      setResult({ type: 'error', message: err instanceof Error ? err.message : 'Send failed' });
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await onSaveDraft();
      setResult({ type: 'success', message: 'Draft saved' });
    } catch {
      setResult({ type: 'error', message: 'Failed to save draft' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Track opens toggle */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white/3 border border-white/8 rounded-lg">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-white/40" />
          <div>
            <div className="text-sm text-white/70">Track opens</div>
            <div className="text-[11px] text-white/30">
              {trackOpens ? 'Sends as HTML email with tracking pixel' : 'Sends as plain text, no tracking'}
            </div>
          </div>
        </div>
        <button
          onClick={() => onTrackOpensChange(!trackOpens)}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
            trackOpens ? 'bg-green-500' : 'bg-white/15'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              trackOpens ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {result && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            result.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {result.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {result.message}
        </div>
      )}

      {showConfirm && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-2">
          <p className="text-sm text-yellow-300">
            Send to <strong>{rowCount}</strong> recipients via{' '}
            <code className="bg-white/10 px-1 rounded text-xs">@{recipientColumn}</code>?
            {trackOpens && <span className="ml-1 text-teal-300">(with open tracking)</span>}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
            >
              {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Send
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSaveDraft}
          disabled={saving || disabled}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/70 text-sm rounded-lg transition-colors border border-white/10"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={disabled || sending || rowCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex-1 justify-center"
        >
          <Send className="w-4 h-4" />
          Send Now ({rowCount})
        </button>
      </div>
    </div>
  );
}
