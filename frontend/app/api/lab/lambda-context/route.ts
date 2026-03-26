import {NextResponse} from 'next/server'

// AWS Lambda Extensions API response from /register
type ExtensionRegisterBody = {
  functionName?: string
  functionVersion?: string
  handler?: string
  accountId?: string
}

export async function GET() {
  const metaHost = process.env.AWS_LAMBDA_METADATA_API

  // Collect available Lambda env vars — some may be absent on Vercel
  const envSnapshot = {
    AWS_LAMBDA_METADATA_API: metaHost ?? null,
    AWS_REGION: process.env.AWS_REGION ?? null,
    // X-Ray trace ID — Lambda sets this automatically per invocation
    _X_AMZN_TRACE_ID: process.env._X_AMZN_TRACE_ID ?? null,
    // These are standard Lambda vars; Vercel may not expose all of them
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ?? null,
    AWS_LAMBDA_FUNCTION_VERSION: process.env.AWS_LAMBDA_FUNCTION_VERSION ?? null,
    AWS_LAMBDA_FUNCTION_MEMORY_SIZE: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE ?? null,
    AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV ?? null,
  }

  if (!metaHost) {
    return NextResponse.json({
      available: false,
      reason: 'AWS_LAMBDA_METADATA_API not set — not running inside a Lambda environment',
      env: envSnapshot,
    })
  }

  // Attempt 1: Extensions API register endpoint.
  // This is non-blocking and returns functionName, functionVersion, handler, accountId.
  // Port 9001 is the Lambda Extensions API sidecar address.
  let extensionData: ExtensionRegisterBody | null = null
  let extensionError: string | null = null
  let extensionId: string | null = null

  try {
    const res = await fetch(`http://${metaHost}/2020-01-01/extension/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lambda-Extension-Name': 'signal-lab-probe',
      },
      body: JSON.stringify({events: []}),
      signal: AbortSignal.timeout(500),
    })
    extensionId = res.headers.get('Lambda-Extension-Identifier')
    if (res.ok) {
      extensionData = await res.json() as ExtensionRegisterBody
    } else {
      extensionError = `HTTP ${res.status}: ${await res.text()}`
    }
  } catch (err) {
    extensionError = err instanceof Error ? err.message : String(err)
  }

  // Attempt 2: Runtime API next-invocation endpoint.
  // This endpoint normally blocks waiting for the next event, so we use a
  // short timeout. If we're mid-invocation it will block — that's expected.
  // We try it anyway to see if this host is the Runtime API instead.
  let runtimeHeaders: Record<string, string> | null = null
  let runtimeError: string | null = null

  try {
    const res = await fetch(`http://${metaHost}/2018-06-01/runtime/invocation/next`, {
      signal: AbortSignal.timeout(150),
    })
    if (res.ok) {
      // Parse the Lambda-Runtime-* headers that contain ARN, trace ID, etc.
      runtimeHeaders = {}
      for (const [k, v] of res.headers.entries()) {
        if (k.startsWith('lambda-runtime-')) runtimeHeaders[k] = v
      }
    } else {
      runtimeError = `HTTP ${res.status}`
    }
  } catch (err) {
    runtimeError = err instanceof Error ? err.message : String(err)
  }

  // Construct ARN from extension register data + region when available
  let constructedArn: string | null = null
  const region = process.env.AWS_REGION
  if (extensionData?.accountId && extensionData?.functionName && region) {
    constructedArn = `arn:aws:lambda:${region}:${extensionData.accountId}:function:${extensionData.functionName}`
    if (extensionData.functionVersion && extensionData.functionVersion !== '$LATEST') {
      constructedArn += `:${extensionData.functionVersion}`
    }
  }

  return NextResponse.json({
    available: true,
    arn: constructedArn,
    xray_trace_id: process.env._X_AMZN_TRACE_ID ?? null,
    env: envSnapshot,
    extensions_api: {
      endpoint: `http://${metaHost}/2020-01-01/extension/register`,
      extension_id: extensionId,
      data: extensionData,
      error: extensionError,
    },
    runtime_api: {
      endpoint: `http://${metaHost}/2018-06-01/runtime/invocation/next`,
      headers: runtimeHeaders,
      error: runtimeError,
      note: runtimeError?.includes('TimeoutError') || runtimeError?.includes('abort')
        ? 'Timed out as expected — invocation/next blocks until the next Lambda event'
        : null,
    },
  })
}
