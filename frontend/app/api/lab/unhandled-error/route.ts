import {trace, SpanStatusCode} from '@opentelemetry/api'

export async function GET() {
  // Set error attributes on the HTTP entry span before throwing.
  // If we only throw and let Next.js handle it, @vercel/otel sets http.status_code: 500
  // but leaves error.type/message/stack empty. Datadog Error Tracking won't surface the
  // error without those attributes on the entry span.
  const span = trace.getActiveSpan()
  const err = new Error('Intentional unhandled error from Signal Lab')

  if (span) {
    // OTel exception convention
    span.recordException(err)
    span.setStatus({code: SpanStatusCode.ERROR, message: err.message})
    // Datadog Error Tracking convention — all three required
    span.setAttribute('error.type', err.name ?? 'Error')
    span.setAttribute('error.message', err.message ?? '')
    span.setAttribute('error.stack', err.stack ?? '')
  }

  throw err
}
