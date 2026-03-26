import {trace, SpanStatusCode} from '@opentelemetry/api'

// Unhandled TypeError — lets Next.js produce the 500.
// Mirrors the existing unhandled-error route but with a TypeError instead of
// a generic Error, to verify Datadog groups these separately by error.type.
export async function GET() {
  const span = trace.getActiveSpan()
  const items: string[] = []
  // Accessing .length on undefined — a common off-by-one/null-check mistake
  const err = new TypeError(`Cannot read properties of undefined (reading 'length') — items[5] is undefined`)

  if (span) {
    span.recordException(err)
    span.setStatus({code: SpanStatusCode.ERROR, message: err.message})
    span.setAttribute('error.type', err.name)
    span.setAttribute('error.message', err.message)
    span.setAttribute('error.stack', err.stack ?? '')
    span.setAttribute('lab.items.length', items.length)
  }

  throw err
}
