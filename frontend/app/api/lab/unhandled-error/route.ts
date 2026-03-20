import {withLabSpan} from '@/lib/telemetry'

// Intentional unhandled error — check Datadog APM + Vercel log drain
export async function GET() {
  return withLabSpan('lab.unhandled_error', {'lab.route': '/api/lab/unhandled-error'}, async () => {
    throw new Error('Intentional unhandled error from Signal Lab')
  })
}
