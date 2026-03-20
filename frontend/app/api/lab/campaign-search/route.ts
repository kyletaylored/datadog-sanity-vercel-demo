import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {client} from '@/sanity/lib/client'
import {labCampaignSearchQuery} from '@/sanity/lib/queries'

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 100)

  if (!q) {
    return NextResponse.json({error: true, message: 'q parameter is required'}, {status: 400})
  }

  return withLabSpan(
    'lab.campaign_search',
    {'lab.route': '/api/lab/campaign-search', 'search.query_length': q.length},
    async () => {
      const results = await client.fetch(labCampaignSearchQuery, {q: `*${q}*`})
      const {traceId, spanId} = getTraceContext()
      structuredLog('info', 'campaign_search', {queryLength: q.length, resultCount: results?.length ?? 0, spanId})
      return NextResponse.json({results: results ?? [], resultCount: results?.length ?? 0, query: q, traceId})
    },
  )
}
