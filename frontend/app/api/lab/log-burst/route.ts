import {withLabSpan, structuredLog, getTraceContext} from '@/lib/telemetry'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const rawCount = Number(body?.count ?? 5)
  const count = Math.max(1, Math.min(50, isNaN(rawCount) ? 5 : rawCount))
  const level: 'info' | 'warn' | 'error' =
    ['info', 'warn', 'error'].includes(body?.level) ? body.level : 'info'

  return withLabSpan(
    'lab.log_burst',
    {'lab.route': '/api/lab/log-burst', 'burst.count': count, 'burst.level': level},
    async () => {
      for (let i = 0; i < count; i++) {
        structuredLog(level, 'log_burst', {'burst.sequence': i + 1, 'burst.total': count})
      }
      const {traceId} = getTraceContext()
      return NextResponse.json({emitted: count, level, traceId})
    },
  )
}
