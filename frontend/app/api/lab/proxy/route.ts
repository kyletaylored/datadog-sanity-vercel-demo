import {withLabSpan, structuredLog, getTraceContext, setSpanError} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^\[::1\]$/,
]

function isPrivateHost(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))
}


export async function POST(request: NextRequest) {
  const body = await request.json()
  const {url, injectLatency = false, forceError = false} = body ?? {}

  if (!url || typeof url !== 'string') {
    return NextResponse.json({error: true, message: 'url is required'}, {status: 400})
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({error: true, message: 'Invalid URL'}, {status: 400})
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({error: true, message: 'Only http/https allowed'}, {status: 400})
  }

  if (isPrivateHost(parsed.hostname)) {
    return NextResponse.json({error: true, message: 'Private/loopback URLs are not allowed'}, {status: 400})
  }

  const targetHost = parsed.hostname

  return withLabSpan(
    'lab.proxy',
    {
      'lab.route': '/api/lab/proxy',
      'proxy.target_host': targetHost,
      'proxy.inject_latency': injectLatency,
      'proxy.force_error': forceError,
    },
    async (span) => {
      if (forceError) {
        setSpanError(span, 'Forced error triggered by proxy route')
        structuredLog('error', 'proxy_request', {targetHost, forcedError: true})
        return NextResponse.json({error: true, message: 'Forced error triggered'}, {status: 500})
      }

      if (injectLatency) {
        await new Promise((r) => setTimeout(r, 800))
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)
      const fetchStart = Date.now()

      try {
        const res = await fetch(url, {signal: controller.signal})
        clearTimeout(timeout)
        const durationMs = Date.now() - fetchStart
        const contentType = res.headers.get('content-type') ?? ''

        const arrayBuffer = await res.arrayBuffer()
        const bodySizeBytes = arrayBuffer.byteLength
        const truncated = arrayBuffer.slice(0, 50 * 1024)
        const body = new TextDecoder().decode(truncated)

        const {traceId, spanId} = getTraceContext()
        structuredLog('info', 'proxy_request', {
          targetHost,
          statusCode: res.status,
          durationMs,
          injectedLatency: injectLatency,
          forcedError: false,
          spanId,
        })

        return NextResponse.json({
          status: res.status,
          contentType,
          bodySizeBytes,
          body,
          durationMs,
          targetHost,
          traceId,
        })
      } catch (err) {
        clearTimeout(timeout)
        const message = (err as Error).message
        structuredLog('error', 'proxy_request', {targetHost, error: message})
        return NextResponse.json({error: true, message}, {status: 500})
      }
    },
  )
}
