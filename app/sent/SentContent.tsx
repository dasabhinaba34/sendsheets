'use client';

import useSWR from 'swr';
import { Send, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { fmtDateTime } from '@/lib/date';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Campaign {
  id: string;
  sheet_id: string;
  subject_template: string;
  sent_count: number;
  failed_count: number;
  total_rows: number;
  status: string;
  sent_at: string;
}

export function SentContent() {
  const { data } = useSWR('/api/emails', fetcher);
  const campaigns: Campaign[] = data?.campaigns ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sent Campaigns</h1>
        <p className="text-gray-500 text-sm mt-1">{campaigns.length} campaigns total</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Send className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No campaigns sent yet</p>
          <Link href="/compose" className="text-green-600 text-sm hover:underline mt-2 inline-block">
            Send your first campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/sent/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{c.subject_template}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {c.sheet_id} · {c.sent_count}/{c.total_rows} sent · {fmtDateTime(c.sent_at)}
                </div>
              </div>
              {c.failed_count > 0 && (
                <span className="text-xs text-red-500 flex-shrink-0">{c.failed_count} failed</span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  c.status === 'done'
                    ? 'bg-green-50 text-green-700'
                    : c.status === 'partial'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {c.status}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
