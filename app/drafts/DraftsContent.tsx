'use client';

import useSWR from 'swr';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Draft {
  id: string;
  sheet_url: string;
  sheet_id: string;
  subject_template: string;
  body_template: string;
  recipient_column: string;
  row_count: number;
  created_at: string;
}

export function DraftsContent() {
  const { data, mutate } = useSWR('/api/emails/draft', fetcher);
  const drafts: Draft[] = data?.drafts ?? [];

  async function deleteDraft(id: string) {
    await fetch(`/api/emails/${id}`, { method: 'DELETE' });
    mutate();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Drafts</h1>
        <p className="text-gray-500 text-sm mt-1">{drafts.length} saved drafts</p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No drafts saved yet</p>
          <Link href="/compose" className="text-green-400 text-sm hover:underline mt-2 inline-block">
            Compose your first campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-medium text-gray-900 truncate">{draft.subject_template || '(no subject)'}</div>
                <div className="text-xs text-gray-500 truncate">{draft.sheet_url || draft.sheet_id}</div>
                <div className="text-xs text-gray-400">
                  {draft.row_count} rows · via @{draft.recipient_column} · {new Date(draft.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => deleteDraft(draft.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
