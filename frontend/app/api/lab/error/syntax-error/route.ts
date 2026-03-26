import {trace, SpanStatusCode} from '@opentelemetry/api'
import {structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

// Simulates a JSON.parse failure — malformed upstream API response.
export async function GET() {
  const span = trace.getActiveSpan()

  try {
    const malformed = '{"user": "alice", "score": }'
    JSON.parse(malformed)
  } catch (err) {
    const error = err as Error
    if (span) {
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      span.setAttribute('error.type', error.name)
      span.setAttribute('error.message', error.message)
      span.setAttribute('error.stack', error.stack ?? '')
      span.setAttribute('lab.input', '{"user": "alice", "score": }')
    }
    structuredLog('error', 'syntax_error', {errorMessage: error.message, errorType: error.name})
    const {traceId} = getTraceContext()
    return NextResponse.json({error: true, type: error.name, message: error.message, traceId}, {status: 500})
  }
}
