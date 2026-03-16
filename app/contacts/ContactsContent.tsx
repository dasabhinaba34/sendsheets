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
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-500 text-sm mt-1">{contacts.length} people emailed</p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No contacts yet. They appear after sending campaigns.</p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Email</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Name</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Emails Received</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Last Emailed</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-900">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.name ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 text-right">{c.emails_received}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 text-right">{new Date(c.last_emailed).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
