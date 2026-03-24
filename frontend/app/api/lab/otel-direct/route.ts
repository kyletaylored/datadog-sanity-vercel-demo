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

async function postOtlp(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{status: number; body: string; ok: boolean}> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', ...headers},
      body: JSON.stringify(body),
    })
    const text = await res.text()
    return {status: res.status, body: text || '(empty)', ok: res.ok}
  } catch (err) {
    return {status: 0, body: String(err), ok: false}
  }
}

function buildResourceAttrs() {
  return [
    {key: 'service.name', value: {stringValue: SERVICE_NAME}},
    {key: 'deployment.environment', value: {stringValue: DEPLOY_ENV}},
    {key: 'lab.direct_test', value: {boolValue: true}},
  ]
}

function buildTracePayload(traceId: string, spanId: string, startNano: string, endNano: string) {
  return {
    resourceSpans: [
      {
        resource: {attributes: buildResourceAttrs()},
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
  }
}

function buildLogPayload(traceId: string, spanId: string, startNano: string) {
  return {
    resourceLogs: [
      {
        resource: {attributes: buildResourceAttrs()},
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
  }
}

function buildMetricPayload(startNano: string) {
  return {
    resourceMetrics: [
      {
        resource: {attributes: buildResourceAttrs()},
        scopeMetrics: [
          {
            scope: {name: 'lab.otel-direct'},
            metrics: [
              {
                name: 'lab.direct_test.count',
                description: 'Direct OTLP test counter from Signal Lab',
                unit: '1',
                sum: {
                  dataPoints: [
                    {
                      startTimeUnixNano: startNano,
                      timeUnixNano: startNano,
                      asDouble: 1,
                      attributes: [{key: 'lab.source', value: {stringValue: 'signal-lab'}}],
                    },
                  ],
                  aggregationTemporality: 2, // CUMULATIVE
                  isMonotonic: true,
                },
              },
            ],
          },
        ],
      },
    ],
  }
}

export async function GET() {
  const startNano = nowNano()
  const endNano = String(BigInt(startNano) + 2_000_000n)

  // Sidecar path
  const sidecarPort = process.env.VERCEL_OTEL_ENDPOINTS_PORT ?? '4318'
  const sidecarBase = `http://localhost:${sidecarPort}`
  const sidecarAvailable = !!process.env.VERCEL_OTEL_ENDPOINTS

  const sidecarTraceId = randomHex(16)
  const sidecarSpanId = randomHex(8)

  // Direct Datadog OTLP path
  const ddApiKey = process.env.DATADOG_API_KEY
  const ddOtlpSource = process.env.DD_OTLP_SOURCE
  const ddSite = process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com'
  const ddBase = `https://otlp.${ddSite}`
  const ddBaseHeaders = ddApiKey ? {'dd-api-key': ddApiKey} : {}
  const ddTraceHeaders = ddOtlpSource
    ? {...ddBaseHeaders, 'dd-otlp-source': ddOtlpSource}
    : ddBaseHeaders
  const ddAvailable = !!ddApiKey

  const ddTraceId = randomHex(16)
  const ddSpanId = randomHex(8)

  const [sidecarTraces, sidecarLogs, ddTraces, ddLogs, ddMetrics] = await Promise.all([
    sidecarAvailable
      ? postOtlp(
          `${sidecarBase}/v1/traces`,
          buildTracePayload(sidecarTraceId, sidecarSpanId, startNano, endNano),
        )
      : Promise.resolve({status: 0, body: 'VERCEL_OTEL_ENDPOINTS not set', ok: false}),

    sidecarAvailable
      ? postOtlp(
          `${sidecarBase}/v1/logs`,
          buildLogPayload(sidecarTraceId, sidecarSpanId, startNano),
        )
      : Promise.resolve({status: 0, body: 'VERCEL_OTEL_ENDPOINTS not set', ok: false}),

    ddAvailable
      ? postOtlp(
          `${ddBase}/v1/traces`,
          buildTracePayload(ddTraceId, ddSpanId, startNano, endNano),
          ddTraceHeaders,
        )
      : Promise.resolve({status: 0, body: 'DATADOG_API_KEY not set', ok: false}),

    ddAvailable
      ? postOtlp(
          `${ddBase}/v1/logs`,
          buildLogPayload(ddTraceId, ddSpanId, startNano),
          ddBaseHeaders,
        )
      : Promise.resolve({status: 0, body: 'DATADOG_API_KEY not set', ok: false}),

    ddAvailable
      ? postOtlp(
          `${ddBase}/v1/metrics`,
          buildMetricPayload(startNano),
          ddBaseHeaders,
        )
      : Promise.resolve({status: 0, body: 'DATADOG_API_KEY not set', ok: false}),
  ])

  return NextResponse.json({
    sidecar: {
      available: sidecarAvailable,
      traceId: sidecarTraceId,
      traces: {endpoint: `${sidecarBase}/v1/traces`, ...sidecarTraces},
      logs: {endpoint: `${sidecarBase}/v1/logs`, ...sidecarLogs},
    },
    datadog: {
      available: ddAvailable,
      endpoint: ddBase,
      traceId: ddTraceId,
      otlpSourceSet: !!ddOtlpSource,
      traces: {endpoint: `${ddBase}/v1/traces`, ...ddTraces},
      logs: {endpoint: `${ddBase}/v1/logs`, ...ddLogs},
      metrics: {endpoint: `${ddBase}/v1/metrics`, ...ddMetrics},
    },
  })
}
