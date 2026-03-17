import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { FadeIn } from '@/components/ui/FadeIn';
import { LiveDemo } from '@/components/ui/LiveDemo';
import {
  Send,
  Sheet,
  Zap,
  BarChart2,
  Users,
  Lock,
  CheckCircle,
  ArrowRight,
  Mail,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow shadow-green-500/30">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">Sendsheets</span>
          </div>
          <a
            href="/api/auth/google"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Get started free
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          Powered by your own Gmail — no new account needed
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto">
          Personalized emails from{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
            Google Sheets
          </span>
          , in minutes
        </h1>

        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Turn any spreadsheet into a personalized email campaign. Load your Sheet, write your
          template with <code className="text-green-600 font-mono text-base bg-green-50 px-1.5 py-0.5 rounded">@column</code> variables,
          and send via Gmail — all in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>
          <span className="text-sm text-gray-400">Free to use · No credit card required</span>
        </div>

        {/* Interactive demo */}
        <div className="mt-16">
          <LiveDemo />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-3 text-gray-500">Three steps from spreadsheet to sent.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector lines */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gray-200" />

            {[
              {
                step: 1,
                icon: FileSpreadsheet,
                title: 'Load your Google Sheet',
                desc: 'Paste any Google Sheets URL. Sendsheets reads your columns and rows automatically — no CSV export needed.',
                color: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                step: 2,
                icon: Mail,
                title: 'Write your template',
                desc: 'Compose your subject and body. Use @first_name, @company, or any column name to personalize each email.',
                color: 'bg-green-50 text-green-600 border-green-100',
              },
              {
                step: 3,
                icon: Send,
                title: 'Send via your Gmail',
                desc: 'Emails are sent from your own Gmail account. Recipients see your name, not a bulk-mail service.',
                color: 'bg-teal-50 text-teal-600 border-teal-100',
              },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <FadeIn key={step} delay={i * 100}>
                <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-full">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="absolute top-8 right-8 text-3xl font-bold text-gray-100 select-none">{step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to run campaigns</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Built for founders, creators, and small teams who live in Google Sheets.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Sheet,
              title: 'Google Sheets native',
              desc: 'Works with any sheet you own. Pick the tab, and Sendsheets maps your columns automatically.',
              color: 'text-green-500',
              bg: 'bg-green-50',
            },
            {
              icon: Zap,
              title: 'Live preview',
              desc: 'See exactly how each email will look before you send, interpolated with real data from row 1.',
              color: 'text-yellow-500',
              bg: 'bg-yellow-50',
            },
            {
              icon: BarChart2,
              title: 'Campaign analytics',
              desc: 'Track delivery rate, open rate, unique opens vs. total opens per campaign — all in one dashboard.',
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              icon: Users,
              title: 'Contact history',
              desc: 'Sendsheets automatically builds a contact list from your sent campaigns, with last-emailed dates.',
              color: 'text-purple-500',
              bg: 'bg-purple-50',
            },
            {
              icon: Lock,
              title: 'Your data stays yours',
              desc: 'Emails are sent via your own Gmail account. We never store email content — only metadata.',
              color: 'text-teal-500',
              bg: 'bg-teal-50',
            },
            {
              icon: CheckCircle,
              title: 'Drafts & scheduling',
              desc: 'Save campaigns as drafts to revisit later. Scheduling support coming soon for time-zone aware sends.',
              color: 'text-orange-500',
              bg: 'bg-orange-50',
            },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <FadeIn key={title} delay={i * 60}>
              <div className="group rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all h-full">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="mt-3 text-gray-500">Free while we&apos;re in beta. No gotchas.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free plan */}
            <FadeIn delay={0}>
              <div className="bg-white rounded-2xl border-2 border-green-500 p-8 shadow-lg shadow-green-500/10 relative h-full">
                <div className="absolute -top-3 left-6">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Current plan
                  </span>
                </div>
                <div className="mb-5">
                  <div className="text-lg font-bold text-gray-900">Free</div>
                  <div className="mt-1 text-4xl font-bold text-gray-900">$0</div>
                  <div className="text-sm text-gray-400 mt-1">Forever, during beta</div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Unlimited campaigns',
                    'Unlimited recipients per send',
                    'Google Sheets integration',
                    'Rich text email composer',
                    'Live preview before sending',
                    'Campaign analytics & open tracking',
                    'Contact history',
                    'Draft saving',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/api/auth/google"
                  className="block w-full text-center py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Get started free
                </a>
              </div>
            </FadeIn>

            {/* Pro plan */}
            <FadeIn delay={100}>
              <div className="bg-white rounded-2xl border border-gray-200 p-8 opacity-70 h-full">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-gray-900">Pro</div>
                    <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                      Coming soon
                    </span>
                  </div>
                  <div className="mt-1 text-4xl font-bold text-gray-400">—</div>
                  <div className="text-sm text-gray-400 mt-1">Planned features</div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Everything in Free',
                    'Scheduled sends (time-zone aware)',
                    'Team workspaces',
                    'Custom sending domain',
                    'Unsubscribe link management',
                    'Priority support',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <Sparkles className="w-4 h-4 text-gray-300 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="block w-full text-center py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                  Notify me
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social proof / differentiator */}
      <section className="bg-gradient-to-br from-green-50 via-white to-teal-50 border-y border-gray-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 leading-snug">
                Not another email marketing platform
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Sendsheets is for people who already work in Google Sheets. No importing contacts,
                no new lists to maintain, no templates that look like newsletters.
              </p>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Your spreadsheet <em>is</em> the list. Your Gmail is the sender. We just connect the two.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  'No subscriber limits or per-email pricing',
                  'Emails land in inboxes, not the Promotions tab',
                  'Full formatting: bold, links, images, HTML',
                  'Works with any Google Sheet you have access to',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '100%', label: 'From your Gmail', sub: 'Authentic deliverability' },
                { value: '@var', label: 'Any column', sub: 'Deep personalization' },
                { value: '∞', label: 'Rows supported', sub: 'No list size limits' },
                { value: '0', label: 'New tools to learn', sub: 'Just Sheets + Gmail' },
              ].map(({ value, label, sub }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                  <div className="text-sm font-medium text-gray-700">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center">
        <FadeIn>
          <div className="max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30 mx-auto mb-6">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Start sending in under 2 minutes
            </h2>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Sign in with Google, paste your Sheet URL, write your email. That&apos;s it.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <GoogleSignInButton />
              <p className="text-xs text-gray-400">
                Only reads your Sheets and sends via Gmail. We don&apos;t store email content.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <Send className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Sendsheets</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs">
                Personalized email campaigns from Google Sheets, sent via your own Gmail.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-gray-400">
              <a href="/dashboard" className="hover:text-gray-600 transition-colors">
                Dashboard
              </a>
              <span className="hidden sm:inline text-gray-200">·</span>
              <span>
                We only request Gmail send scope and Sheets read scope — nothing more.
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Sendsheets. Free during beta.</p>
            <p>Built by Abhinaba Das.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
