import { Sidebar } from '@/components/layout/Sidebar';
import { ComposeContent } from './ComposeContent';

export default function ComposePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ComposeContent />
      </main>
    </div>
  );
}
