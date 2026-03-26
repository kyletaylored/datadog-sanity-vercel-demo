import {NextResponse} from 'next/server'

export async function GET() {
  const metaHost = process.env.AWS_LAMBDA_METADATA_API

  if (!metaHost) {
    return NextResponse.json({
      available: false,
      reason: 'AWS_LAMBDA_METADATA_API not set — not running inside a Lambda environment',
    })
  }

  // The Lambda Runtime API's invocation/next endpoint returns the current
  // invocation's metadata in response headers. Unlike the Extensions API
  // (which closes registration after the init phase), this endpoint is
  // accessible from within a request handler and returns immediately with
  // the current invocation context.
  let runtimeData: {
    request_id: string | null
    arn: string | null
    trace_id: string | null
    deadline_ms: number | null
    deadline_utc: string | null
  } | null = null
  let runtimeError: string | null = null

  try {
    const res = await fetch(`http://${metaHost}/2018-06-01/runtime/invocation/next`, {
      signal: AbortSignal.timeout(300),
    })

    if (res.ok) {
      const deadlineRaw = res.headers.get('lambda-runtime-deadline-ms')
      const deadlineMs = deadlineRaw ? parseInt(deadlineRaw, 10) : null

      runtimeData = {
        request_id: res.headers.get('lambda-runtime-aws-request-id'),
        arn: res.headers.get('lambda-runtime-invoked-function-arn'),
        trace_id: res.headers.get('lambda-runtime-trace-id'),
        deadline_ms: deadlineMs,
        deadline_utc: deadlineMs ? new Date(deadlineMs).toISOString() : null,
      }
    } else {
      runtimeError = `HTTP ${res.status}: ${await res.text()}`
    }
  } catch (err) {
    runtimeError = err instanceof Error ? err.message : String(err)
  }

  // Parse the X-Ray trace ID into its components for easier reading.
  // Format: Root=1-{hex-time}-{hex-id};Parent={span-id};Sampled={0|1};Lineage=...
  let xrayParsed: Record<string, string> | null = null
  const rawTraceId = runtimeData?.trace_id
  if (rawTraceId) {
    xrayParsed = Object.fromEntries(
      rawTraceId.split(';').map((part) => {
        const eq = part.indexOf('=')
        return [part.slice(0, eq), part.slice(eq + 1)]
      }),
    )
  }

  // Parse the function name and account ID out of the ARN.
  // Format: arn:aws:lambda:{region}:{accountId}:function:{functionName}[:{qualifier}]
  let arnParsed: {
    partition: string
    region: string
    account_id: string
    function_name: string
    qualifier: string | null
  } | null = null
  const rawArn = runtimeData?.arn
  if (rawArn) {
    const parts = rawArn.split(':')
    // parts: ['arn', 'aws', 'lambda', region, accountId, 'function', name, qualifier?]
    if (parts.length >= 7) {
      arnParsed = {
        partition: parts[1],
        region: parts[3],
        account_id: parts[4],
        function_name: parts[6],
        qualifier: parts[7] ?? null,
      }
    }
  }

  return NextResponse.json({
    available: true,
    arn: runtimeData?.arn ?? null,
    arn_parsed: arnParsed,
    request_id: runtimeData?.request_id ?? null,
    trace_id: runtimeData?.trace_id ?? null,
    trace_id_parsed: xrayParsed,
    deadline_ms: runtimeData?.deadline_ms ?? null,
    deadline_utc: runtimeData?.deadline_utc ?? null,
    runtime_api: {
      host: metaHost,
      error: runtimeError,
    },
  })
}
