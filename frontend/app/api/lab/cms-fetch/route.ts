import {withLabSpan, structuredLog, getTraceContext, getLabTracer} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import {client} from '@/sanity/lib/client'
import {labLatestPostsQuery} from '@/sanity/lib/queries'

export async function GET() {
  return withLabSpan('lab.cms_fetch', {'lab.route': '/api/lab/cms-fetch'}, async () => {
    const tracer = getLabTracer()
    const documents = await tracer.startActiveSpan('sanity.groq_query', async (childSpan) => {
      try {
        const docs = await client.fetch(labLatestPostsQuery)
        childSpan.end()
        return docs
      } catch (err) {
        childSpan.end()
        throw err
      }
    })
    const {traceId, spanId} = getTraceContext()
    structuredLog('info', 'cms_fetch', {documentCount: documents?.length ?? 0, spanId})
    return NextResponse.json({documents: documents ?? [], count: documents?.length ?? 0, traceId})
  })
}
