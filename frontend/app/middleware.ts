import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {trace} from '@opentelemetry/api'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const span = trace.getActiveSpan()
  if (span) {
    const ctx = span.spanContext()
    response.headers.set('x-trace-id', ctx.traceId)
    response.headers.set('x-span-id', ctx.spanId)
  }
  return response
}

export const config = {
  matcher: ['/api/lab/:path*'],
}
