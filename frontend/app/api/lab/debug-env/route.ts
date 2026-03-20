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
      .sort(([a], [b]) => a.localeCompare(b)),
  )

  return NextResponse.json({env: filtered, redacted: 'Keys matching token/secret/password/auth/key/cert patterns are omitted'})
}
