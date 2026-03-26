import {trace, SpanStatusCode} from '@opentelemetry/api'

// Unhandled custom error subclass with HTTP context — tests whether Datadog
// fingerprints by custom class name and surfaces extra span attributes.
class UpstreamServiceError extends Error {
  readonly statusCode: number
  readonly service: string

  constructor(message: string, statusCode: number, service: string) {
    super(message)
    this.name = 'UpstreamServiceError'
    this.statusCode = statusCode
    this.service = service
  }
}

export async function GET() {
  const span = trace.getActiveSpan()
  const err = new UpstreamServiceError(
    'Segment service returned 503 Service Unavailable',
    503,
    'segment-api',
  )

  if (span) {
    span.recordException(err)
    span.setStatus({code: SpanStatusCode.ERROR, message: err.message})
    span.setAttribute('error.type', err.name)
    span.setAttribute('error.message', err.message)
    span.setAttribute('error.stack', err.stack ?? '')
    span.setAttribute('upstream.service', err.service)
    span.setAttribute('upstream.status_code', err.statusCode)
  }

  throw err
}
