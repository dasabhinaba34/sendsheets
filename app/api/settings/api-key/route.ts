import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { getApiKey, setApiKey } from '@/lib/db/apiKey'
import { randomBytes } from 'crypto'

async function requireAuth() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  return session.userEmail ?? null
}

export async function GET() {
  const userEmail = await requireAuth()
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const record = await getApiKey()
  if (!record) return NextResponse.json({ hasKey: false, maskedKey: null, createdAt: null })

  const masked = '••••••••••••••••••••••••' + record.key.slice(-8)
  return NextResponse.json({ hasKey: true, maskedKey: masked, createdAt: record.createdAt })
}

export async function POST(req: NextRequest) {
  const userEmail = await requireAuth()
  if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const newKey = randomBytes(32).toString('hex')
  await setApiKey(newKey)

  return NextResponse.json({ key: newKey })
}
