import { Sidebar } from '@/components/layout/Sidebar';
import { CampaignDetail } from './CampaignDetail';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <CampaignDetail id={id} />
      </main>
    </div>
  );
}
