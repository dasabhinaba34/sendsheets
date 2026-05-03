'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Copy, Check, RefreshCw, Key, Mail, Loader2, AlertTriangle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function ProviderCard() {
  const { data, mutate } = useSWR('/api/settings/provider', fetcher)
  const [provider, setProvider] = useState<'gmail' | 'postmark' | null>(null)
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const currentProvider = provider ?? data?.provider ?? 'gmail'

  // Initialise local form state once data loads
  if (data && provider === null) {
    if (data.fromEmail) setFromEmail(data.fromEmail)
    if (data.fromName) setFromName(data.fromName)
    setProvider(data.provider ?? 'gmail')
  }

  async function handleSave() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/settings/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: currentProvider,
          fromEmail: fromEmail || undefined,
          fromName: fromName || undefined,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setStatus({ ok: false, message: result.error ?? 'Failed to save.' })
      } else {
        setStatus({ ok: true, message: 'Saved.' })
        mutate()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setStatus(null)
    try {
      const res = await fetch('/api/settings/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', provider: 'postmark', fromEmail: fromEmail || undefined }),
      })
      const result = await res.json()
      if (!res.ok) {
        setStatus({ ok: false, message: result.error ?? 'Connection failed.' })
      } else {
        setStatus({ ok: true, message: 'Connection successful!' })
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Email Provider</h2>
          <p className="text-xs text-gray-400 mt-0.5">Choose how your campaigns are delivered</p>
        </div>
      </div>

      {/* Provider selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="provider"
              value="gmail"
              checked={currentProvider === 'gmail'}
              onChange={() => { setProvider('gmail'); setStatus(null) }}
              className="accent-gray-900"
            />
            <span className="text-sm text-gray-800 font-medium">Gmail</span>
            {data?.provider === 'gmail' && (
              <span className="ml-auto text-xs text-green-600 font-medium">Active</span>
            )}
          </label>
          <label className="flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="provider"
              value="postmark"
              checked={currentProvider === 'postmark'}
              onChange={() => { setProvider('postmark'); setStatus(null) }}
              className="accent-gray-900"
            />
            <span className="text-sm text-gray-800 font-medium">Postmark</span>
            {data?.provider === 'postmark' && (
              <span className="ml-auto text-xs text-green-600 font-medium">Active</span>
            )}
          </label>
        </div>
      </div>

      {/* Postmark fields */}
      {currentProvider === 'postmark' && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From address</label>
            <input
              type="email"
              value={fromEmail}
              onChange={e => setFromEmail(e.target.value)}
              placeholder="you@yourdomain.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From name <span className="normal-case font-normal text-gray-400">(optional)</span></label>
            <input
              type="text"
              value={fromName}
              onChange={e => setFromName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      )}

      {/* Status message */}
      {status && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${status.ok ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {status.ok ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
          {status.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {currentProvider === 'postmark' && (
          <button
            onClick={handleTest}
            disabled={testing || saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {testing ? 'Testing…' : 'Test connection'}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || testing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function SettingsContent() {
  const { data, mutate } = useSWR('/api/settings/api-key', fetcher)
  const [generating, setGenerating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const hasKey = data?.hasKey ?? false
  const maskedKey = data?.maskedKey ?? null
  const createdAt = data?.createdAt ?? null

  async function handleGenerate() {
    setGenerating(true)
    setNewKey(null)
    setCopied(false)
    try {
      const res = await fetch('/api/settings/api-key', { method: 'POST' })
      const result = await res.json()
      setNewKey(result.key)
      mutate()
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your email provider and API access</p>
      </div>

      <ProviderCard />

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Key className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Internal API Key</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Used by CRM integrations to send email on your behalf via <code className="bg-gray-100 px-1 rounded">POST /api/send</code>
            </p>
          </div>
        </div>

        {/* Current key status */}
        {hasKey && maskedKey && !newKey && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Key</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700">
              {maskedKey}
            </div>
            {createdAt && (
              <p className="text-xs text-gray-400">
                Generated {new Date(createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
            )}
          </div>
        )}

        {!hasKey && !newKey && (
          <div className="px-3 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            No API key has been generated yet. Generate one below to enable CRM email sending.
          </div>
        )}

        {/* Newly generated key — shown once */}
        {newKey && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">New API Key</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg font-mono text-xs text-green-800 break-all">
                {newKey}
              </code>
              <button
                onClick={() => handleCopy(newKey)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-amber-600 font-medium">
              Copy this key now — it won&apos;t be shown again. Add it to your CRM as <code className="bg-amber-50 px-1 rounded">SENDSHEETS_API_KEY</code>.
            </p>
          </div>
        )}

        <div className="pt-1">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating…' : hasKey ? 'Regenerate Key' : 'Generate Key'}
          </button>
          {hasKey && (
            <p className="text-xs text-gray-400 mt-2">
              Regenerating will invalidate the current key immediately.
            </p>
          )}
        </div>
      </div>

      {/* Usage instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">How to use</h3>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Generate an API key above and copy it.</li>
          <li>
            Add it to your CRM app&apos;s environment as{' '}
            <code className="bg-white border border-gray-200 px-1 py-0.5 rounded">SENDSHEETS_API_KEY</code>.
          </li>
          <li>
            Set{' '}
            <code className="bg-white border border-gray-200 px-1 py-0.5 rounded">SENDSHEETS_URL</code>{' '}
            to this app&apos;s URL.
          </li>
          <li>Each team member signs in here once to connect their Gmail.</li>
        </ol>
      </div>
    </div>
  )
}
