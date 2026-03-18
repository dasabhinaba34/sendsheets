import { Sidebar } from '@/components/layout/Sidebar'
import { SettingsContent } from './SettingsContent'

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <SettingsContent />
      </main>
    </div>
  )
}
