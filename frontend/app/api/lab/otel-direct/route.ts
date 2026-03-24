import {NextResponse} from 'next/server'
import {SERVICE_NAME, DEPLOY_ENV} from '@/lib/config'

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function nowNano(): string {
  return String(BigInt(Date.now()) * 1_000_000n)
}

async function postOtlp(path: string, body: unknown): Promise<{status: number; body: string; ok: boolean}> {
  const port = process.env.VERCEL_OTEL_ENDPOINTS_PORT ?? '4318'
  const url = `http://localhost:${port}${path}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
    const text = await res.text()
    return {status: res.status, body: text || '(empty)', ok: res.ok}
  } catch (err) {
    return {status: 0, body: String(err), ok: false}
  }
}

export async function GET() {
  const sidecarAvailable = !!process.env.VERCEL_OTEL_ENDPOINTS
  const port = process.env.VERCEL_OTEL_ENDPOINTS_PORT ?? '4318'

  const traceId = randomHex(16)
  const spanId = randomHex(8)
  const startNano = nowNano()
  const endNano = String(BigInt(startNano) + 2_000_000n) // +2ms

  const resourceAttrs = [
    {key: 'service.name', value: {stringValue: SERVICE_NAME}},
    {key: 'deployment.environment', value: {stringValue: DEPLOY_ENV}},
    {key: 'lab.direct_test', value: {boolValue: true}},
  ]

  const [traceResult, logResult] = await Promise.all([
    postOtlp('/v1/traces', {
      resourceSpans: [
        {
          resource: {attributes: resourceAttrs},
          scopeSpans: [
            {
              scope: {name: 'lab.otel-direct', version: '1.0.0'},
              spans: [
                {
                  traceId,
                  spanId,
                  name: 'lab.direct-otlp-test',
                  kind: 2, // SERVER
                  startTimeUnixNano: startNano,
                  endTimeUnixNano: endNano,
                  status: {code: 1},
                  attributes: [
                    {key: 'lab.source', value: {stringValue: 'signal-lab'}},
                    {key: 'http.method', value: {stringValue: 'GET'}},
                    {key: 'http.route', value: {stringValue: '/api/lab/otel-direct'}},
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    postOtlp('/v1/logs', {
      resourceLogs: [
        {
          resource: {attributes: resourceAttrs},
          scopeLogs: [
            {
              scope: {name: 'lab.otel-direct'},
              logRecords: [
                {
                  timeUnixNano: startNano,
                  observedTimeUnixNano: startNano,
                  severityNumber: 9, // INFO
                  severityText: 'INFO',
                  body: {stringValue: 'Direct OTLP log test from Signal Lab'},
                  traceId,
                  spanId,
                  attributes: [
                    {key: 'lab.source', value: {stringValue: 'signal-lab'}},
                    {key: 'event', value: {stringValue: 'lab.direct_otlp_log'}},
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ])

  return NextResponse.json({
    sidecarAvailable,
    sidecarPort: port,
    traceId,
    spanId,
    traces: {
      endpoint: `http://localhost:${port}/v1/traces`,
      ...traceResult,
    },
    logs: {
      endpoint: `http://localhost:${port}/v1/logs`,
      ...logResult,
    },
  })
}
