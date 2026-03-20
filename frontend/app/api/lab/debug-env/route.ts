import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

// Patterns for env var names that should never be returned, even with valid auth.
const SECRET_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /passwd/i,
  /api_key/i,
  /apikey/i,
  /private/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /signing/i,
]

function isSensitive(key: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(key))
}

function redactValue(value: string | undefined): string | undefined {
  if (!value) return value
  // Redact values that appear to contain embedded secrets (e.g. JSON with api-key fields)
  if (SECRET_PATTERNS.some((p) => p.test(value))) return '[redacted — contains sensitive data]'
  return value
}

export async function POST(request: NextRequest) {
  const secret = process.env.DEBUG_SECRET
  if (!secret) {
    return NextResponse.json({error: 'Debug endpoint not configured'}, {status: 404})
  }

  let body: {password?: string} = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({error: 'Invalid JSON'}, {status: 400})
  }

  if (body.password !== secret) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const filtered = Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => !isSensitive(key))
      .map(([key, value]) => [key, redactValue(value)])
      .sort(([a], [b]) => (a as string).localeCompare(b as string)),
  )

  return NextResponse.json({env: filtered, redacted: 'Keys matching sensitive patterns are omitted; values containing sensitive data are redacted'})
}
