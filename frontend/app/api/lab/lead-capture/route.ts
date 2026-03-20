import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {name, email, company, interestedIn} = body ?? {}

  if (!name) {
    return NextResponse.json({error: true, message: 'name is required'}, {status: 422})
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({error: true, message: 'valid email is required'}, {status: 422})
  }

  const fieldsCount = [name, email, company, interestedIn].filter(Boolean).length

  return withLabSpan(
    'lab.lead_capture',
    {'lab.route': '/api/lab/lead-capture', 'form.fields_submitted': fieldsCount},
    async () => {
      const {traceId, spanId} = getTraceContext()
      structuredLog('info', 'lead_capture', {company, interestedIn, fieldsCount, spanId})
      return NextResponse.json({received: true, company, interestedIn, traceId})
    },
  )
}
