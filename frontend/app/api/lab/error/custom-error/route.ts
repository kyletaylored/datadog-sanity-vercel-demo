import {trace, SpanStatusCode} from '@opentelemetry/api'
import {structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'

// Custom error subclass with extra context fields — tests how Datadog surfaces
// non-standard error types and whether fingerprinting groups by class name.
class DatabaseConnectionError extends Error {
  readonly code: string
  readonly host: string

  constructor(message: string, code: string, host: string) {
    super(message)
    this.name = 'DatabaseConnectionError'
    this.code = code
    this.host = host
  }
}

export async function GET() {
  const span = trace.getActiveSpan()

  try {
    throw new DatabaseConnectionError(
      'Connection refused after 3 retries',
      'ECONNREFUSED',
      'db-primary.internal:5432',
    )
  } catch (err) {
    const error = err as DatabaseConnectionError
    if (span) {
      span.recordException(error)
      span.setStatus({code: SpanStatusCode.ERROR, message: error.message})
      span.setAttribute('error.type', error.name)
      span.setAttribute('error.message', error.message)
      span.setAttribute('error.stack', error.stack ?? '')
      span.setAttribute('db.error.code', error.code)
      span.setAttribute('db.host', error.host)
    }
    structuredLog('error', 'db_connection_error', {
      errorMessage: error.message,
      errorType: error.name,
      code: error.code,
      host: error.host,
    })
    const {traceId} = getTraceContext()
    return NextResponse.json(
      {error: true, type: error.name, message: error.message, code: error.code, host: error.host, traceId},
      {status: 500},
    )
  }
}
