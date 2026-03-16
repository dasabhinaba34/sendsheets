import { Sidebar } from '@/components/layout/Sidebar';

export default function SheetsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-white">Sheets</h1>
        <p className="text-white/40 text-sm mt-1">Use the Compose page to load and work with sheets.</p>
      </main>
    </div>
  );
}
