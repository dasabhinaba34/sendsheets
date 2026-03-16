'use client';

import useSWR from 'swr';
import { Calendar } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-white">Scheduled</h1>
        <p className="text-white/40 text-sm mt-1">{scheduled.length} pending campaigns</p>
      </div>

      {scheduled.length === 0 ? (
        <div className="bg-white/3 border border-white/5 rounded-xl p-12 text-center">
          <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No scheduled campaigns</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduled.map((s) => (
            <div key={s.id} className="bg-white/5 border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-white">{s.draft_id ?? 'Campaign'}</div>
                <div className="text-xs text-white/40 mt-0.5">
                  Scheduled for {new Date(s.send_at).toLocaleString()}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.status === 'pending' ? 'bg-blue-500/10 text-blue-400' :
                s.status === 'fired' ? 'bg-green-500/10 text-green-400' :
                'bg-white/5 text-white/40'
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
