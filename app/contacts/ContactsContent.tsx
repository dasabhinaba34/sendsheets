'use client';

import useSWR from 'swr';
import { Users } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Contact {
  id: string;
  email: string;
  name: string | null;
  emails_received: number;
  last_emailed: string;
}

export function ContactsContent() {
  const { data } = useSWR('/api/contacts', fetcher);
  const contacts: Contact[] = data?.contacts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <p className="text-white/40 text-sm mt-1">{contacts.length} people emailed</p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white/3 border border-white/5 rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No contacts yet. They appear after sending campaigns.</p>
        </div>
      ) : (
        <div className="bg-white/3 border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-xs text-white/40 font-medium">Name</th>
                <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Emails Received</th>
                <th className="text-right px-5 py-3 text-xs text-white/40 font-medium">Last Emailed</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-white/3 last:border-0 hover:bg-white/2">
                  <td className="px-5 py-3 text-sm text-white">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-white/60">{c.name ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-white/60 text-right">{c.emails_received}</td>
                  <td className="px-5 py-3 text-xs text-white/30 text-right">{new Date(c.last_emailed).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
