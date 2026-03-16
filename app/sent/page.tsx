import { Sidebar } from '@/components/layout/Sidebar';
import { SentContent } from './SentContent';

export default function SentPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <SentContent />
      </main>
    </div>
  );
}
