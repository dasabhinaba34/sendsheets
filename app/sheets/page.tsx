import { Sidebar } from '@/components/layout/Sidebar';

export default function SheetsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Sheets</h1>
        <p className="text-gray-500 text-sm mt-1">Use the Compose page to load and work with sheets.</p>
      </main>
    </div>
  );
}
