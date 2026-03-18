import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/google/gmail'
import { getTokensByEmail } from '@/lib/db/tokens'
import { getApiKey } from '@/lib/db/apiKey'

function interpolate(template: string, recipient: { name: string; email: string }): string {
  return template
    .replace(/\{\{name\}\}/g, recipient.name)
    .replace(/\{\{email\}\}/g, recipient.email)
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const record = await getApiKey()
  const validKey = record?.key ?? process.env.SENDSHEETS_INTERNAL_API_KEY
  if (!validKey || apiKey !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userEmail, recipients, subject, body: bodyTemplate } = body as {
    userEmail: string
    recipients: { name: string; email: string }[]
    subject: string
    body: string
  }

  if (!userEmail || !Array.isArray(recipients) || !subject || !bodyTemplate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const tokens = await getTokensByEmail(userEmail)
  if (!tokens) {
    return NextResponse.json(
      { error: 'user_not_connected', message: 'User has not signed in to Sendsheets' },
      { status: 404 }
    )
  }

  let sent = 0
  const failed: { email: string; error: string }[] = []

  for (const recipient of recipients) {
    if (!recipient.email) {
      failed.push({ email: recipient.name || '(unknown)', error: 'No email address' })
      continue
    }
    try {
      const interpolatedSubject = interpolate(subject, recipient)
      const interpolatedBody = interpolate(bodyTemplate, recipient)
      await sendEmail(userEmail, recipient.email, interpolatedSubject, interpolatedBody)
      sent++
    } catch (err) {
      failed.push({
        email: recipient.email,
        error: err instanceof Error ? err.message : 'Failed to send',
      })
    }
  }

  return NextResponse.json({ sent, failed })
}
