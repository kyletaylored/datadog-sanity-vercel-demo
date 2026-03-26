import {NextResponse} from 'next/server'
import * as v8 from 'v8'
import {monitorEventLoopDelay} from 'perf_hooks'
import {metrics} from '@opentelemetry/api'

// ─── Module-level observers (accumulate across warm requests) ────────────────

// GC pause accumulator — PerformanceObserver is global in Node 18+
let gcPauseCount = 0
let gcPauseSumNs = 0
try {
  const gcObs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      gcPauseCount++
      gcPauseSumNs += Math.round(entry.duration * 1_000_000) // ms → ns
    }
  })
  gcObs.observe({type: 'gc', buffered: true})
} catch { /* GC observation not available */ }

// Event loop delay histogram — samples every 20ms
const elDelay = monitorEventLoopDelay({resolution: 20})
elDelay.enable()

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET() {
  const mem = process.memoryUsage()
  const heap = v8.getHeapStatistics()
  const heapSpaces = v8.getHeapSpaceStatistics()

  // CPU — measure over a 20ms window to compute a meaningful percentage
  const cpuBefore = process.cpuUsage()
  const hrBefore = process.hrtime.bigint()
  await new Promise<void>((r) => setTimeout(r, 20))
  const cpuDelta = process.cpuUsage(cpuBefore)
  const elapsedUs = Number(process.hrtime.bigint() - hrBefore) / 1000
  const cpuUser = +(cpuDelta.user / elapsedUs * 100).toFixed(2)
  const cpuSystem = +(cpuDelta.system / elapsedUs * 100).toFixed(2)

  // Event loop — use accumulated histogram
  const elCount = elDelay.count
  // .sum is available Node 22+; fall back to count * mean
  const elSumNs = 'sum' in elDelay ? Number((elDelay as unknown as {sum: number | bigint}).sum) : Math.round(elDelay.count * elDelay.mean)

  const snapshot = {
    memory: {
      rss_mb: +(mem.rss / 1024 / 1024).toFixed(2),
      heap_used_mb: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      heap_total_mb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
      external_mb: +(mem.external / 1024 / 1024).toFixed(2),
    },
    cpu: {
      user_pct: cpuUser,
      system_pct: cpuSystem,
      total_pct: +(cpuUser + cpuSystem).toFixed(2),
    },
    heap: {
      heap_size_limit_mb: +(heap.heap_size_limit / 1024 / 1024).toFixed(2),
      total_available_mb: +(heap.total_available_size / 1024 / 1024).toFixed(2),
      malloced_mb: +(heap.malloced_memory / 1024 / 1024).toFixed(2),
      native_contexts: heap.number_of_native_contexts,
      detached_contexts: heap.number_of_detached_contexts,
    },
    heap_spaces: heapSpaces.map((s) => ({
      space: s.space_name,
      size_mb: +(s.space_size / 1024 / 1024).toFixed(2),
      used_mb: +(s.space_used_size / 1024 / 1024).toFixed(2),
    })),
    event_loop: {
      delay_count: elCount,
      delay_sum_ns: elSumNs,
      delay_mean_ns: +elDelay.mean.toFixed(0),
      delay_max_ns: elDelay.max,
    },
    gc: {
      pause_count: gcPauseCount,
      pause_sum_ns: gcPauseSumNs,
    },
    process: {
      uptime_s: +process.uptime().toFixed(2),
      node_version: process.version,
      platform: process.platform,
    },
  }

  // Emit OTel gauges/counters under Datadog's runtime.node.* namespaces
  try {
    const meter = metrics.getMeter('lab.runtime-metrics')
    const a = {'lab.source': 'signal-lab', 'lab.trigger': 'manual'}

    // Memory — runtime.node.mem.*
    meter.createObservableGauge('runtime.node.mem.rss',        {unit: 'By'}).addCallback((o) => o.observe(mem.rss, a))
    meter.createObservableGauge('runtime.node.mem.heap_used',  {unit: 'By'}).addCallback((o) => o.observe(mem.heapUsed, a))
    meter.createObservableGauge('runtime.node.mem.heap_total', {unit: 'By'}).addCallback((o) => o.observe(mem.heapTotal, a))
    meter.createObservableGauge('runtime.node.mem.external',   {unit: 'By'}).addCallback((o) => o.observe(mem.external, a))

    // Heap totals — runtime.node.heap.*
    meter.createObservableGauge('runtime.node.heap.used_heap_size',  {unit: 'By'}).addCallback((o) => o.observe(heap.used_heap_size, a))
    meter.createObservableGauge('runtime.node.heap.total_heap_size', {unit: 'By'}).addCallback((o) => o.observe(heap.total_heap_size, a))
    meter.createObservableGauge('runtime.node.heap.heap_size_limit', {unit: 'By'}).addCallback((o) => o.observe(heap.heap_size_limit, a))
    meter.createObservableGauge('runtime.node.heap.malloced_memory', {unit: 'By'}).addCallback((o) => o.observe(heap.malloced_memory, a))

    // Heap by space — one observation per V8 heap space
    for (const space of heapSpaces) {
      const sa = {...a, 'heap.space': space.space_name}
      meter.createObservableGauge('runtime.node.heap.size.by.space',      {unit: 'By'}).addCallback((o) => o.observe(space.space_size, sa))
      meter.createObservableGauge('runtime.node.heap.used_size.by.space', {unit: 'By'}).addCallback((o) => o.observe(space.space_used_size, sa))
    }

    // CPU — fraction (0-1); Datadog displays as percent
    meter.createObservableGauge('runtime.node.cpu.user',   {unit: '1'}).addCallback((o) => o.observe(cpuUser / 100, a))
    meter.createObservableGauge('runtime.node.cpu.system', {unit: '1'}).addCallback((o) => o.observe(cpuSystem / 100, a))
    meter.createObservableGauge('runtime.node.cpu.total',  {unit: '1'}).addCallback((o) => o.observe((cpuUser + cpuSystem) / 100, a))

    // Event loop delay — monotonic counters (SDK computes delta for DELTA exporter)
    meter.createObservableCounter('runtime.node.event_loop.delay.count')          .addCallback((o) => o.observe(elCount, a))
    meter.createObservableCounter('runtime.node.event_loop.delay.sum', {unit: 'ns'}).addCallback((o) => o.observe(elSumNs, a))

    // GC pauses — monotonic counters
    meter.createObservableCounter('runtime.node.gc.pause.count')          .addCallback((o) => o.observe(gcPauseCount, a))
    meter.createObservableCounter('runtime.node.gc.pause.sum', {unit: 'ns'}).addCallback((o) => o.observe(gcPauseSumNs, a))

    // Process uptime
    meter.createObservableGauge('runtime.node.process.uptime', {unit: 's'}).addCallback((o) => o.observe(process.uptime(), a))
  } catch {
    // No MeterProvider configured (DATADOG_API_KEY not set) — silently skipped
  }

  return NextResponse.json(snapshot)
}
