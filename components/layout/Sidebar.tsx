'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Mail, FileText, Users, Calendar, Send, LogOut } from 'lucide-react';
import useSWR from 'swr';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/compose', label: 'Compose', icon: Mail },
  { href: '/drafts', label: 'Drafts', icon: FileText },
  { href: '/sent', label: 'Sent', icon: Send },
  { href: '/scheduled', label: 'Scheduled', icon: Calendar },
  { href: '/contacts', label: 'Contacts', icon: Users },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSWR('/api/auth/me', fetcher);
  const user = data?.user;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <aside className="w-60 bg-[#0a0a0f] text-white min-h-screen flex flex-col border-r border-white/5">
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white leading-none">Sendsheets</div>
            <div className="text-[10px] text-white/30 mt-0.5">Sheet-powered email</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        {user && (
          <div className="flex items-center gap-2 mb-3">
            {user.picture && (
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/70 truncate">{user.name ?? user.email}</div>
              <div className="text-[10px] text-white/30 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
