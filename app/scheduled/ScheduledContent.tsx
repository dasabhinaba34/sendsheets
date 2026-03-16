'use client';

import useSWR from 'swr';
import { Calendar } from 'lucide-react';
import { fmtDateTime } from '@/lib/date';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ScheduledCampaign {
  id: string;
  draft_id: string | null;
  send_at: string;
  status: string;
  created_at: string;
}

export function ScheduledContent() {
  const { data } = useSWR('/api/scheduled', fetcher);
  const scheduled: ScheduledCampaign[] = data?.scheduled ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scheduled</h1>
        <p className="text-gray-500 text-sm mt-1">{scheduled.length} pending campaigns</p>
      </div>

      {scheduled.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No scheduled campaigns</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduled.map((s) => (
            <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">{s.draft_id ?? 'Campaign'}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Scheduled for {fmtDateTime(s.send_at)}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.status === 'pending' ? 'bg-blue-50 text-blue-700' :
                s.status === 'fired' ? 'bg-green-50 text-green-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
