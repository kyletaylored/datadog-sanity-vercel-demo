import {createHash} from 'crypto'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = String(body?.email ?? '').trim().toLowerCase()
  const name = String(body?.name ?? '').trim() || email.split('@')[0]

  if (!email || !email.includes('@')) {
    return NextResponse.json({error: 'Valid email required'}, {status: 400})
  }

  const hash = createHash('md5').update(email).digest('hex')
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`

  return NextResponse.json({email, name, avatarUrl})
}
