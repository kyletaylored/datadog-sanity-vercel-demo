import {withLabSpan, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import {client} from '@/sanity/lib/client'
import {defineQuery} from 'next-sanity'

const featureFlagsQuery = defineQuery(`
  *[_type == "featureFlag"] {
    "key": key,
    "label": label,
    "enabled": enabled,
    "description": description,
  }
`)

export async function GET() {
  return withLabSpan('lab.flags_fetch', {'lab.route': '/api/lab/flags'}, async () => {
    const flags = await client.fetch(featureFlagsQuery)
    const {traceId} = getTraceContext()
    return NextResponse.json({flags: flags ?? [], traceId})
  })
}
