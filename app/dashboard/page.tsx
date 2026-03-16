import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardContent } from './DashboardContent';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <DashboardContent />
      </main>
    </div>
  );
}
