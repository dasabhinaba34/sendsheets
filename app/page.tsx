import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Send } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 text-center space-y-8">
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Send className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Sendsheets</h1>
          <p className="text-gray-500 text-lg">
            Send personalized emails to everyone in your Google Sheet — powered by Gmail.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center py-4">
          {[
            { label: 'Load Sheet', desc: 'Paste any Google Sheets URL' },
            { label: 'Compose', desc: 'Use @column variables' },
            { label: 'Send', desc: 'Via your own Gmail account' },
          ].map((step, i) => (
            <div key={i} className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold flex items-center justify-center mx-auto">
                {i + 1}
              </div>
              <div className="text-xs font-medium text-gray-600">{step.label}</div>
              <div className="text-[10px] text-gray-400">{step.desc}</div>
            </div>
          ))}
        </div>

        <GoogleSignInButton />

        <p className="text-[11px] text-gray-300">
          Only accesses your Gmail to send emails and your Sheets to read data.
        </p>
      </div>
    </div>
  );
}
