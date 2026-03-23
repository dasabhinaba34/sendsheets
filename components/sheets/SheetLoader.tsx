'use client';

import { useState } from 'react';
import { Link2, Loader2, TableProperties } from 'lucide-react';

interface SheetLoaderProps {
  onLoad: (data: { sheetId: string; headers: string[]; rows: Record<string, string>[]; rowCount: number; activeTab: string }, url: string) => void;
}

export function SheetLoader({ onLoad }: SheetLoaderProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabs, setTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');

  async function fetchData(sheetUrl: string, tab: string) {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: sheetUrl, tab }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to load sheet');
    return data;
  }

  async function handleLoad() {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setTabs([]);
    setActiveTab('');
    try {
      const data = await fetchData(url, 'Sheet1');
      const returnedTabs: string[] = data.tabs ?? [];
      const firstTab = returnedTabs[0] ?? 'Sheet1';
      const resolvedTab = data.activeTab ?? firstTab;
      setTabs(returnedTabs);
      setActiveTab(resolvedTab);
      onLoad({ ...data, activeTab: resolvedTab }, url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load sheet');
    } finally {
      setLoading(false);
    }
  }

  async function handleTabChange(tab: string) {
    setActiveTab(tab);
    setTabLoading(true);
    setError('');
    try {
      const data = await fetchData(url, tab);
      onLoad({ ...data, activeTab: tab }, url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load sheet');
    } finally {
      setTabLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">Google Sheet URL</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500/50"
          />
        </div>
        <button
          onClick={handleLoad}
          disabled={loading || !url.trim()}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Load
        </button>
      </div>

      {tabs.length > 1 && (
        <div className="flex items-center gap-2 pt-1">
          <TableProperties className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500">Sheet tab:</span>
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                disabled={tabLoading}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                  tab === activeTab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tabLoading && tab === activeTab ? (
                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />{tab}</span>
                ) : tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
