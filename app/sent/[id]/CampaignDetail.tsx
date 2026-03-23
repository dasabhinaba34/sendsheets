'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, EyeOff, ArrowLeft, Mail, AlertCircle, BarChart2, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { fmtDateTime, fmtTime, fmtShort } from '@/lib/date';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Campaign {
  id: string;
  sheet_id: string;
  subject_template: string;
  body_template: string;
  recipient_column: string;
  total_rows: number;
  sent_count: number;
  failed_count: number;
  status: string;
  sent_at: string;
  completed_at: string | null;
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

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-2xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export function CampaignDetail({ id }: { id: string }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  // Poll fast while sending, stop once finished
  const { data, isLoading } = useSWR(`/api/emails/${id}`, fetcher, {
    refreshInterval: (d) => d?.campaign?.status === 'sending' ? 2000 : 0,
  });

  async function handleRetry() {
    setRetrying(true);
    try {
      const res = await fetch(`/api/emails/${id}/retry`, { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Retry failed');
      router.push(`/sent/${result.campaignId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Retry failed');
      setRetrying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading…</div>
    );
  }

  if (!data?.campaign) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Campaign not found.</div>
    );
  }

  const campaign: Campaign = data.campaign;
  const emails: SentEmail[] = data.emails ?? [];

  const opened = emails.filter((e) => e.open_count > 0).length;
  const delivered = emails.filter((e) => e.status === 'sent').length;
  const failed = emails.filter((e) => e.status === 'failed').length;
  const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  const deliveryRate = campaign.total_rows > 0 ? Math.round((delivered / campaign.total_rows) * 100) : 0;
  const totalOpens = emails.reduce((s, e) => s + (e.open_count ?? 0), 0);

  const statusColor =
    campaign.status === 'done' ? 'bg-green-50 text-green-700' :
    campaign.status === 'partial' ? 'bg-yellow-50 text-yellow-700' :
    'bg-gray-100 text-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/sent" className="mt-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{campaign.subject_template}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{campaign.status}</span>
            {(campaign.status === 'partial' || campaign.status === 'failed' || (campaign.status === 'done' && campaign.sent_count < campaign.total_rows)) && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50 transition-colors font-medium"
              >
                {retrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {retrying ? 'Starting…' : 'Retry unsent'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {campaign.sheet_id} · sent {fmtDateTime(campaign.sent_at)}
            {campaign.completed_at && ` · completed ${fmtDateTime(campaign.completed_at)}`}
          </p>
        </div>
      </div>

      {/* Live sending progress */}
      {campaign.status === 'sending' && (() => {
        // Use actual email records as the source of truth — campaign.sent_count
        // may be 0 for campaigns stuck before the try/finally fix was deployed.
        const processed = delivered + failed;
        const pct = campaign.total_rows > 0 ? Math.round((processed / campaign.total_rows) * 100) : 0;
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              <span className="text-sm font-medium text-blue-700">Sending in progress…</span>
              <span className="ml-auto text-sm font-semibold text-blue-700">{processed} / {campaign.total_rows}</span>
            </div>
            <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-blue-500">
              <span>{delivered} sent · {failed} failed</span>
              <span>{pct}% complete</span>
            </div>
          </div>
        );
      })()}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={campaign.total_rows} />
        <StatCard label="Delivered" value={delivered} color="text-green-700" sub={`${deliveryRate}% delivery`} />
        <StatCard label="Failed" value={failed} color={failed > 0 ? 'text-red-600' : 'text-gray-900'} />
        <StatCard label="Unique Opens" value={opened} color="text-teal-600" sub={`${openRate}% open rate`} />
        <StatCard label="Total Opens" value={totalOpens} color="text-teal-600" sub="incl. re-opens" />
        <StatCard label="Not Opened" value={delivered - opened} color="text-gray-500" />
      </div>

      {/* Open rate bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Open Rate</span>
          <span className="ml-auto text-sm font-bold text-teal-600">{openRate}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${openRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400">
          <span>{opened} opened</span>
          <span>{delivered - opened} not opened</span>
        </div>
      </div>

      {/* Recipient table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Recipients</span>
          <span className="ml-auto text-xs text-gray-400">{emails.length} emails</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Recipient</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">Opens</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Last Opened</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-800">{email.recipient}</td>
                  <td className="px-4 py-3 text-center">
                    {email.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full" title={email.error ?? ''}>
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {email.open_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium">
                        <Eye className="w-3.5 h-3.5" /> {email.open_count}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                        <EyeOff className="w-3.5 h-3.5" /> 0
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {email.opened_at ? fmtShort(email.opened_at) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 text-right">{fmtTime(email.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed emails detail */}
      {failed > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="w-4 h-4" />
            {failed} failed {failed === 1 ? 'delivery' : 'deliveries'}
          </div>
          {emails.filter((e) => e.status === 'failed').map((e) => (
            <div key={e.id} className="text-xs text-red-600">
              <span className="font-medium">{e.recipient}</span>
              {e.error && <span className="text-red-400 ml-2">— {e.error}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
