import { Sidebar } from '@/components/layout/Sidebar';
import { ContactsContent } from './ContactsContent';

export default function ContactsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <ContactsContent />
      </main>
    </div>
  );
}
