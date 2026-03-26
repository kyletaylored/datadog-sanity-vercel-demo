import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {trace} from '@opentelemetry/api'
import {SERVICE_NAME, DEPLOY_ENV, SERVICE_VERSION, DEPLOY_REGION, HOST_NAME, GIT_REPO_URL} from '@/lib/config'

function nowNano(): string {
  return String(BigInt(Date.now()) * 1_000_000n)
}

export async function POST(request: NextRequest) {
  const ddApiKey = process.env.DATADOG_API_KEY
  const ddSite = process.env.NEXT_PUBLIC_DD_SITE ?? 'datadoghq.com'

  if (!ddApiKey) {
    return NextResponse.json(
      {error: 'DATADOG_API_KEY not set — required for direct OTLP log submission'},
      {status: 400},
    )
  }

  const body = await request.json().catch(() => ({}))
  const message = String(body?.message ?? 'Direct OTLP log test from Signal Lab')
  const level: 'info' | 'warn' | 'error' =
    ['info', 'warn', 'error'].includes(body?.level) ? body.level : 'info'

  const severityMap = {info: 9, warn: 13, error: 17}
  const now = nowNano()
  const endpoint = `https://otlp.${ddSite}/v1/logs`

  const spanContext = trace.getActiveSpan()?.spanContext()
  const traceId = spanContext?.traceId ?? ''
  const spanId = spanContext?.spanId ?? ''

  const payload = {
    resourceLogs: [
      {
        resource: {
          attributes: [
            {key: 'service.name', value: {stringValue: SERVICE_NAME}},
            {key: 'deployment.environment', value: {stringValue: DEPLOY_ENV}},
            {key: 'service.version', value: {stringValue: SERVICE_VERSION}},
            {key: 'deployment.region', value: {stringValue: DEPLOY_REGION}},
            {key: 'host.name', value: {stringValue: HOST_NAME}},
            ...(GIT_REPO_URL ? [{key: 'git.repository_url', value: {stringValue: GIT_REPO_URL}}] : []),
          ],
        },
        scopeLogs: [
          {
            scope: {name: 'lab.otlp-logs', version: '1.0.0'},
            logRecords: [
              {
                timeUnixNano: now,
                observedTimeUnixNano: now,
                severityNumber: severityMap[level],
                severityText: level.toUpperCase(),
                body: {stringValue: message},
                ...(traceId ? {traceId, spanId} : {}),
                attributes: [
                  {key: 'lab.source', value: {stringValue: 'signal-lab'}},
                  {key: 'event', value: {stringValue: 'lab.otlp_log'}},
                  {key: 'lab.delivery_path', value: {stringValue: 'direct-otlp'}},
                  ...(traceId ? [
                    {key: 'trace_id', value: {stringValue: traceId}},
                    {key: 'span_id', value: {stringValue: spanId}},
                  ] : []),
                ],
              },
            ],
          },
        ],
      },
    ],
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'dd-api-key': ddApiKey},
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    return NextResponse.json({
      endpoint,
      status: res.status,
      ok: res.ok,
      response: text || '(empty)',
      message,
      level,
    })
  } catch (err) {
    return NextResponse.json({error: String(err)}, {status: 500})
  }
}
