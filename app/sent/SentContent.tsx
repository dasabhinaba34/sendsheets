'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Send, ChevronDown, ChevronRight, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

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

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  error: string | null;
  sent_at: string;
  opened_at: string | null;
  open_count: number;
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  const [expanded, setExpanded] = useState(false);
  const { data } = useSWR(expanded ? `/api/emails/${campaign.id}` : null, fetcher, {
    refreshInterval: expanded ? 5000 : 0,
  });
  const emails: SentEmail[] = data?.emails ?? [];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{campaign.subject_template}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {campaign.sheet_id} · {campaign.sent_count}/{campaign.total_rows} sent · {new Date(campaign.sent_at).toLocaleString()}
          </div>
        </div>
        {expanded && data && (
          <span className="text-xs text-gray-400 flex-shrink-0">
            {data.emails?.filter((e: SentEmail) => e.open_count > 0).length ?? 0} opened
          </span>
        )}
        <span
          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
            campaign.status === 'done'
              ? 'bg-green-50 text-green-700'
              : campaign.status === 'partial'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {campaign.status}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-200">
          {emails.map((email) => (
            <div key={email.id} className="px-5 py-2.5 flex items-center gap-3 border-b border-gray-100 last:border-0">
              {email.status === 'sent' ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 truncate">{email.recipient}</div>
                {email.error && <div className="text-[10px] text-red-400">{email.error}</div>}
              </div>
              {email.status === 'sent' && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {email.open_count > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] text-teal-400">
                      <Eye className="w-3 h-3" />
                      {email.open_count > 1 ? `${email.open_count}×` : 'Opened'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <EyeOff className="w-3 h-3" />
                      Not opened
                    </span>
                  )}
                </div>
              )}
              <div className="text-[10px] text-gray-400">{new Date(email.sent_at).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
          <Link href="/compose" className="text-green-400 text-sm hover:underline mt-2 inline-block">
            Send your first campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => <CampaignRow key={c.id} campaign={c} />)}
        </div>
      )}
    </div>
  );
}
