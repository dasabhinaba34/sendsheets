import { Sidebar } from '@/components/layout/Sidebar';
import { ScheduledContent } from './ScheduledContent';

export default function ScheduledPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <ScheduledContent />
      </main>
    </div>
  );
}
