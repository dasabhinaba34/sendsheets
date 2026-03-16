'use client';

import useSWR from 'swr';
import { Send, FileText, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { fmtDate } from '@/lib/date';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DashboardContent() {
  const { data: emailsData } = useSWR('/api/emails', fetcher);
  const { data: draftsData } = useSWR('/api/emails/draft', fetcher);
  const { data: meData } = useSWR('/api/auth/me', fetcher);

  const campaigns = emailsData?.campaigns ?? [];
  const drafts = draftsData?.drafts ?? [];
  const user = meData?.user;

  const totalSent = campaigns.reduce((s: number, c: { sent_count: number }) => s + (c.sent_count ?? 0), 0);
  const doneCampaigns = campaigns.filter((c: { status: string }) => c.status === 'done').length;

  const stats = [
    { label: 'Campaigns Sent', value: campaigns.length, icon: Send, color: 'text-green-400' },
    { label: 'Emails Delivered', value: totalSent, icon: CheckCircle, color: 'text-teal-400' },
    { label: 'Saved Drafts', value: drafts.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Completed', value: doneCampaigns, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Your email campaign overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Campaigns</h2>
          <Link href="/sent" className="text-xs text-green-400 hover:text-green-300">View all</Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">No campaigns yet.</p>
            <Link href="/compose" className="text-green-400 text-sm hover:underline mt-2 inline-block">
              Start your first campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.slice(0, 5).map((c: { id: string; sheet_id: string; sent_count: number; failed_count: number; status: string; sent_at: string }) => (
              <div key={c.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900 font-medium">{c.sheet_id}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {c.sent_count} sent · {c.failed_count} failed · {fmtDate(c.sent_at)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'done'
                      ? 'bg-green-50 text-green-700'
                      : c.status === 'partial'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-green-400 mb-2">Ready to send?</h3>
        <p className="text-gray-500 text-xs mb-3">Load a Google Sheet, compose your email with @column variables, and send to everyone at once.</p>
        <Link href="/compose" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors">
          <Send className="w-4 h-4" />
          New Campaign
        </Link>
      </div>
    </div>
  );
}
