import { Sidebar } from '@/components/layout/Sidebar';
import { DraftsContent } from './DraftsContent';

export default function DraftsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <DraftsContent />
      </main>
    </div>
  );
}
