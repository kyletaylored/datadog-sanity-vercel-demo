'use client'

import { useState, useEffect } from 'react'
import { Activity, Search, AlertTriangle, FileText, Globe, Terminal } from 'lucide-react'
import LabSection from '@/app/components/lab/LabSection'
import LabCard from '@/app/components/lab/LabCard'
import ResultDisplay from '@/app/components/lab/ResultDisplay'
import { labFetch } from '@/app/lab/useLab'

type Status = 'idle' | 'loading' | 'success' | 'error'

function useLabAction<T = Record<string, unknown>>(route: string, options?: RequestInit) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<T | null>(null)
  const [traceId, setTraceId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const trigger = async (overrideOptions?: RequestInit) => {
    setStatus('loading')
    setError(null)
    const r = await labFetch<T>(route, overrideOptions ?? options)
    setTraceId(r.traceId)
    if (r.error) {
      setStatus('error')
      setError(r.error)
      setResult(r.data)
    } else {
      setStatus('success')
      setResult(r.data)
    }
  }

  return { status, result, traceId, error, trigger }
}

const SECTION_IDS = ['section-api', 'section-forms', 'section-search', 'section-proxy', 'section-logs', 'section-otlp', 'section-debug', 'section-errors']
const btnClass = 'px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50'

export default function LabPage() {
  const health = useLabAction('/api/lab/health')
  const envInfo = useLabAction('/api/lab/env-info')
  const cmsFetch = useLabAction('/api/lab/cms-fetch')
  const handledError = useLabAction('/api/lab/handled-error')
  const unhandledError = useLabAction('/api/lab/unhandled-error')

  const [slowDelay, setSlowDelay] = useState('2000')
  const slowQuery = useLabAction(`/api/lab/slow-query?delay=${slowDelay}`)

  const [chainResult, setChainResult] = useState<Record<string, unknown> | null>(null)
  const [chainStatus, setChainStatus] = useState<Status>('idle')
  const [chainTraceId, setChainTraceId] = useState('')

  const [leadForm, setLeadForm] = useState({ name: '', email: '', company: '', interestedIn: '' })
  const [leadStatus, setLeadStatus] = useState<Status>('idle')
  const [leadResult, setLeadResult] = useState<Record<string, unknown> | null>(null)
  const [leadTraceId, setLeadTraceId] = useState('')

  const [searchQ, setSearchQ] = useState('')
  const [searchStatus, setSearchStatus] = useState<Status>('idle')
  const [searchResult, setSearchResult] = useState<Record<string, unknown> | null>(null)
  const [searchTraceId, setSearchTraceId] = useState('')

  const [proxyUrl, setProxyUrl] = useState('https://httpbin.org/json')
  const [proxyInjectLatency, setProxyInjectLatency] = useState(false)
  const [proxyForceError, setProxyForceError] = useState(false)
  const [proxyStatus, setProxyStatus] = useState<Status>('idle')
  const [proxyResult, setProxyResult] = useState<Record<string, unknown> | null>(null)
  const [proxyTraceId, setProxyTraceId] = useState('')

  const [burstCount, setBurstCount] = useState('5')
  const [burstLevel, setBurstLevel] = useState<'info' | 'warn' | 'error'>('info')
  const [burstStatus, setBurstStatus] = useState<Status>('idle')
  const [burstResult, setBurstResult] = useState<Record<string, unknown> | null>(null)
  const [burstTraceId, setBurstTraceId] = useState('')

  const [attrKey, setAttrKey] = useState('lab.custom.demo')
  const [attrValue, setAttrValue] = useState('hello')
  const [attrStatus, setAttrStatus] = useState<Status>('idle')
  const [attrResult, setAttrResult] = useState<Record<string, unknown> | null>(null)
  const [attrTraceId, setAttrTraceId] = useState('')

  const [envData, setEnvData] = useState<Record<string, string> | null>(null)
  const [activeSection, setActiveSection] = useState('')

  const [debugPassword, setDebugPassword] = useState('')
  const [debugStatus, setDebugStatus] = useState<Status>('idle')
  const [debugResult, setDebugResult] = useState<Record<string, unknown> | null>(null)

  const [otlpLogMsg, setOtlpLogMsg] = useState('Hello from Signal Lab')
  const [otlpLogLevel, setOtlpLogLevel] = useState<'info' | 'warn' | 'error'>('info')
  const [otlpLogStatus, setOtlpLogStatus] = useState<Status>('idle')
  const [otlpLogResult, setOtlpLogResult] = useState<Record<string, unknown> | null>(null)

  const otlpDirect = useLabAction('/api/lab/otel-direct')
  const runtimeMetrics = useLabAction('/api/lab/runtime-metrics')

  useEffect(() => {
    labFetch<Record<string, string>>('/api/lab/env-info').then((r) => {
      if (r.data) setEnvData(r.data)
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) setActiveSection(intersecting[0].target.id)
      },
      { rootMargin: '-104px 0px -40% 0px', threshold: 0 },
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const randomizeLead = () => {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Drew', 'Blake']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
    const companies = ['Acme Corp', 'Initech', 'Umbrella Inc', 'Globex', 'Hooli', 'Pied Piper', 'Dunder Mifflin']
    const interests = ['APM', 'RUM', 'Log Management', 'Infrastructure', 'Security', 'Synthetics', 'CI Visibility']
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    const first = pick(firstNames)
    const last = pick(lastNames)
    setLeadForm({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${pick(['example', 'test', 'demo'])}.com`,
      company: pick(companies),
      interestedIn: pick(interests),
    })
  }

  const handleLead = async () => {
    setLeadStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/lead-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadForm),
    })
    setLeadTraceId(r.traceId)
    setLeadResult(r.data)
    setLeadStatus(r.error ? 'error' : 'success')
  }

  const handleSearch = async () => {
    setSearchStatus('loading')
    const r = await labFetch<Record<string, unknown>>(`/api/lab/campaign-search?q=${encodeURIComponent(searchQ)}`)
    setSearchTraceId(r.traceId)
    setSearchResult(r.data)
    setSearchStatus(r.error ? 'error' : 'success')
  }

  const handleProxy = async () => {
    setProxyStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: proxyUrl, injectLatency: proxyInjectLatency, forceError: proxyForceError }),
    })
    setProxyTraceId(r.traceId)
    setProxyResult(r.data)
    setProxyStatus(r.error ? 'error' : 'success')
  }

  const handleBurst = async () => {
    setBurstStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/log-burst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: parseInt(burstCount), level: burstLevel }),
    })
    setBurstTraceId(r.traceId)
    setBurstResult(r.data)
    setBurstStatus(r.error ? 'error' : 'success')
  }

  const handleAttr = async () => {
    setAttrStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/custom-attribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: attrKey, value: attrValue }),
    })
    setAttrTraceId(r.traceId)
    setAttrResult(r.data)
    setAttrStatus(r.error ? 'error' : 'success')
  }

  const handleOtlpLog = async () => {
    setOtlpLogStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/otlp-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: otlpLogMsg, level: otlpLogLevel }),
    })
    setOtlpLogResult(r.data)
    setOtlpLogStatus(r.error ? 'error' : 'success')
  }

  const handleDebugEnv = async () => {
    setDebugStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/debug-env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: debugPassword }),
    })
    setDebugResult(r.data)
    setDebugStatus(r.error ? 'error' : 'success')
  }

  const handleChain = async () => {
    setChainStatus('loading')
    const r = await labFetch<Record<string, unknown>>('/api/lab/chain')
    setChainTraceId(r.traceId)
    setChainResult(r.data)
    setChainStatus(r.error ? 'error' : 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">⚡ Signal Lab</h1>
          <p className="mt-2 text-gray-600 max-w-2xl text-sm sm:text-base">
            Trigger real API calls, generate traces, emit logs, and produce errors — all wired to Datadog APM, RUM, and Logs via the Vercel log drain.
          </p>
        </div>

        {/* Mobile section nav — horizontal scroll pill row */}
        <div className="lg:hidden -mx-4 px-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-max font-mono text-xs">
            {[
              { id: 'section-api', label: 'API Triggers' },
              { id: 'section-forms', label: 'Forms' },
              { id: 'section-search', label: 'Campaign Search' },
              { id: 'section-proxy', label: 'Proxy' },
              { id: 'section-logs', label: 'Log Emitter' },
              { id: 'section-otlp', label: 'OTLP Direct' },
              { id: 'section-debug', label: 'Debug' },
              { id: 'section-errors', label: 'Error Triggers' },
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
                  activeSection === id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Sections</h3>
                <ul className="text-xs space-y-1 font-mono text-gray-600">
                  {[
                    { id: 'section-api', label: 'API Triggers' },
                    { id: 'section-forms', label: 'Forms' },
                    { id: 'section-search', label: 'Campaign Search' },
                    { id: 'section-proxy', label: 'Proxy' },
                    { id: 'section-logs', label: 'Log Emitter' },
                    { id: 'section-otlp', label: 'OTLP Direct' },
                    { id: 'section-debug', label: 'Debug' },
                    { id: 'section-errors', label: 'Error Triggers' },
                  ].map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={`block py-1 px-2 rounded transition-colors ${activeSection === id
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'hover:bg-gray-50 hover:text-gray-900 text-gray-500'
                          }`}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Environment</h3>
                {envData ? (
                  <dl className="space-y-2 text-xs font-mono">
                    {Object.entries(envData).filter(([k]) => k !== 'traceId').map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-gray-400">{k}</dt>
                        <dd className="text-gray-900 truncate">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-xs text-gray-400">Loading env info...</p>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Quick Links</h3>
                <ul className="text-xs space-y-2 font-mono text-gray-600">
                  <li><a href="/api/lab/health" target="_blank" className="hover:underline">/api/lab/health ↗</a></li>
                  <li><a href="/api/lab/env-info" target="_blank" className="hover:underline">/api/lab/env-info ↗</a></li>
                  <li><a href="/api/lab/cms-fetch" target="_blank" className="hover:underline">/api/lab/cms-fetch ↗</a></li>
                  <li><a href="/api/lab/flags" target="_blank" className="hover:underline">/api/lab/flags ↗</a></li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main panel */}
          <div className="lg:col-span-3 space-y-6">

            {/* API Triggers */}
            <div id="section-api"><LabSection title="API Triggers" icon={Activity}>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabCard title="Health Check" description="GET /api/lab/health — basic liveness check with trace." status={health.status}>
                  <button className={btnClass} onClick={() => health.trigger()} disabled={health.status === 'loading'}>Trigger</button>
                  {health.result && <ResultDisplay data={health.result} traceId={health.traceId} />}
                </LabCard>

                <LabCard title="Env Info" description="GET /api/lab/env-info — safe Vercel env snapshot." status={envInfo.status}>
                  <button className={btnClass} onClick={() => envInfo.trigger()} disabled={envInfo.status === 'loading'}>Trigger</button>
                  {envInfo.result && <ResultDisplay data={envInfo.result} traceId={envInfo.traceId} />}
                </LabCard>

                <LabCard title="CMS Fetch" description="GET /api/lab/cms-fetch — fetch latest posts from Sanity." status={cmsFetch.status}>
                  <button className={btnClass} onClick={() => cmsFetch.trigger()} disabled={cmsFetch.status === 'loading'}>Trigger</button>
                  {cmsFetch.result && <ResultDisplay data={cmsFetch.result} traceId={cmsFetch.traceId} />}
                </LabCard>

                <LabCard title="Slow Query" description="Artificial delay to trigger latency traces." status={slowQuery.status}>
                  <div className="flex gap-2 items-center mb-3">
                    <label className="text-xs text-gray-500">Delay (ms):</label>
                    <input
                      type="number"
                      value={slowDelay}
                      onChange={(e) => setSlowDelay(e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-sm font-mono"
                      min={500}
                      max={8000}
                    />
                  </div>
                  <button className={btnClass} onClick={() => slowQuery.trigger()} disabled={slowQuery.status === 'loading'}>Trigger</button>
                  {slowQuery.result && <ResultDisplay data={slowQuery.result} traceId={slowQuery.traceId} />}
                </LabCard>

                <LabCard title="Chain (3 hops)" description="Chained fetch through /api/lab/health × 3." status={chainStatus}>
                  <button className={btnClass} onClick={handleChain} disabled={chainStatus === 'loading'}>Trigger</button>
                  {chainResult && <ResultDisplay data={chainResult} traceId={chainTraceId} />}
                </LabCard>
              </div>
            </LabSection></div>

            {/* Forms */}
            <div id="section-forms"><LabSection title="Forms" icon={FileText}>
              <LabCard title="Lead Capture" description="POST /api/lab/lead-capture — validates and logs a form submission." status={leadStatus}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(['name', 'email', 'company', 'interestedIn'] as const).map((f) => (
                    <input
                      key={f}
                      placeholder={f}
                      value={leadForm[f]}
                      onChange={(e) => setLeadForm((prev) => ({ ...prev, [f]: e.target.value }))}
                      className="border rounded px-3 py-2 text-sm"
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className={btnClass} onClick={randomizeLead}>Randomize</button>
                  <button className={btnClass} onClick={handleLead} disabled={leadStatus === 'loading'}>Submit</button>
                </div>
                {leadResult && <ResultDisplay data={leadResult} traceId={leadTraceId} />}
              </LabCard>
            </LabSection></div>

            {/* Search */}
            <div id="section-search"><LabSection title="Campaign Search" icon={Search}>
              <LabCard title="Search Posts" description="GET /api/lab/campaign-search?q= — Sanity GROQ search." status={searchStatus}>
                <div className="flex gap-2 mb-3">
                  <input
                    placeholder="Search query..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className={btnClass} onClick={handleSearch} disabled={searchStatus === 'loading'}>Search</button>
                </div>
                {searchResult && <ResultDisplay data={searchResult} traceId={searchTraceId} />}
              </LabCard>
            </LabSection></div>

            {/* Proxy */}
            <div id="section-proxy"><LabSection title="Proxy" icon={Globe}>
              <LabCard title="Outbound Proxy" description="POST /api/lab/proxy — fetch an external URL through the server." status={proxyStatus}>
                <div className="space-y-3 mb-3">
                  <input
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border rounded px-3 py-2 text-sm font-mono"
                  />
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={proxyInjectLatency} onChange={(e) => setProxyInjectLatency(e.target.checked)} />
                      Inject latency
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={proxyForceError} onChange={(e) => setProxyForceError(e.target.checked)} />
                      Force error
                    </label>
                  </div>
                  <div className="flex gap-2 text-xs font-mono text-gray-500">
                    Quick:
                    {['https://wttr.in/Austin?format=j1', 'https://httpbin.org/json'].map((u) => (
                      <button key={u} onClick={() => setProxyUrl(u)} className="hover:underline truncate max-w-32">{u.replace('https://', '')}</button>
                    ))}
                  </div>
                </div>
                <button className={btnClass} onClick={handleProxy} disabled={proxyStatus === 'loading'}>Send</button>
                {proxyResult && <ResultDisplay data={proxyResult} traceId={proxyTraceId} />}
              </LabCard>
            </LabSection></div>

            {/* Log Emitter */}
            <div id="section-logs"><LabSection title="Log Emitter" icon={Terminal}>
              <LabCard title="Log Burst" description="POST /api/lab/log-burst — emit N structured log lines." status={burstStatus}>
                <div className="flex gap-3 items-center mb-3">
                  <input
                    type="number"
                    value={burstCount}
                    onChange={(e) => setBurstCount(e.target.value)}
                    min={1}
                    max={50}
                    className="w-20 border rounded px-2 py-1 text-sm font-mono"
                  />
                  <select
                    value={burstLevel}
                    onChange={(e) => setBurstLevel(e.target.value as 'info' | 'warn' | 'error')}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option>info</option>
                    <option>warn</option>
                    <option>error</option>
                  </select>
                  <button className={btnClass} onClick={handleBurst} disabled={burstStatus === 'loading'}>Emit</button>
                </div>
                {burstResult && <ResultDisplay data={burstResult} traceId={burstTraceId} />}
              </LabCard>

              <LabCard title="Custom Attribute" description="POST /api/lab/custom-attribute — set a span attribute." status={attrStatus}>
                <div className="flex gap-2 mb-3">
                  <input
                    value={attrKey}
                    onChange={(e) => setAttrKey(e.target.value)}
                    placeholder="attribute.key"
                    className="flex-1 border rounded px-3 py-2 text-sm font-mono"
                  />
                  <input
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                    placeholder="value"
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <button className={btnClass} onClick={handleAttr} disabled={attrStatus === 'loading'}>Set</button>
                </div>
                {attrResult && <ResultDisplay data={attrResult} traceId={attrTraceId} />}
              </LabCard>
            </LabSection></div>

            {/* OTLP Direct */}
            <div id="section-otlp"><LabSection title="OTLP Direct" icon={Terminal}>
              <LabCard title="Direct OTLP Test" description="GET /api/lab/otel-direct — sends a trace, log, and metric directly to Datadog's OTLP intake (and the Vercel sidecar if available). Verifies dd-otlp-source is accepted for all three signals." status={otlpDirect.status}>
                <button className={btnClass} onClick={() => otlpDirect.trigger()} disabled={otlpDirect.status === 'loading'}>Send</button>
                {otlpDirect.result && (() => {
                  const dd = (otlpDirect.result as Record<string, Record<string, {ok?: boolean}>>)?.datadog
                  const signals: {label: string; ok: boolean | undefined}[] = [
                    {label: 'Trace', ok: dd?.traces?.ok},
                    {label: 'Log', ok: dd?.logs?.ok},
                    {label: 'Metric', ok: dd?.metrics?.ok},
                  ]
                  return (
                    <div className="flex gap-4 mt-3">
                      {signals.map(({label, ok}) => (
                        <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className={`w-2 h-2 rounded-full ${ok === true ? 'bg-green-500' : ok === false ? 'bg-red-500' : 'bg-gray-300'}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  )
                })()}
                {otlpDirect.result && <ResultDisplay data={otlpDirect.result} traceId={otlpDirect.traceId} />}
              </LabCard>

              <LabCard title="Direct OTLP Log" description="POST /api/lab/otlp-logs — send a log directly to Datadog's OTLP logs endpoint, bypassing the Vercel drain. Requires DATADOG_API_KEY." status={otlpLogStatus}>
                <div className="flex gap-2 mb-3">
                  <input
                    value={otlpLogMsg}
                    onChange={(e) => setOtlpLogMsg(e.target.value)}
                    placeholder="Log message..."
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <select
                    value={otlpLogLevel}
                    onChange={(e) => setOtlpLogLevel(e.target.value as 'info' | 'warn' | 'error')}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option>info</option>
                    <option>warn</option>
                    <option>error</option>
                  </select>
                  <button className={btnClass} onClick={handleOtlpLog} disabled={otlpLogStatus === 'loading'}>Send</button>
                </div>
                {otlpLogResult && <ResultDisplay data={otlpLogResult} />}
              </LabCard>

              <LabCard title="Runtime Metrics Snapshot" description="GET /api/lab/runtime-metrics — snapshots heap, RSS, CPU, and uptime, then emits them as OTel gauges. Works alongside background RuntimeNodeInstrumentation metrics." status={runtimeMetrics.status}>
                <button className={btnClass} onClick={() => runtimeMetrics.trigger()} disabled={runtimeMetrics.status === 'loading'}>Snapshot</button>
                {runtimeMetrics.result && <ResultDisplay data={runtimeMetrics.result} />}
              </LabCard>
            </LabSection></div>

            {/* Debug */}
            <div id="section-debug"><LabSection title="Debug" icon={Terminal}>
              <LabCard title="Environment Inspector" description="POST /api/lab/debug-env — requires DEBUG_SECRET passcode. Sensitive keys are redacted." status={debugStatus}>
                <form
                  className="flex gap-2 mb-3"
                  onSubmit={(e) => { e.preventDefault(); handleDebugEnv() }}
                >
                  <input
                    type="password"
                    placeholder="Passcode"
                    autoComplete="on"
                    value={debugPassword}
                    onChange={(e) => setDebugPassword(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm font-mono"
                  />
                  <button type="submit" className={btnClass} disabled={debugStatus === 'loading'}>Inspect</button>
                </form>
                {debugResult && <ResultDisplay data={debugResult} />}
              </LabCard>
            </LabSection></div>

            {/* Error Triggers */}
            <div id="section-errors"><LabSection title="Error Triggers" icon={AlertTriangle}>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabCard title="Handled Error" description="GET /api/lab/handled-error — throws and catches, returns 500." status={handledError.status}>
                  <button className={btnClass} onClick={() => handledError.trigger()} disabled={handledError.status === 'loading'}>Trigger</button>
                  {handledError.result && <ResultDisplay data={handledError.result} traceId={handledError.traceId} />}
                </LabCard>
                <LabCard title="Unhandled Error" description="GET /api/lab/unhandled-error — throws without catching (500)." status={unhandledError.status}>
                  <button className={btnClass} onClick={() => unhandledError.trigger()} disabled={unhandledError.status === 'loading'}>Trigger</button>
                  {unhandledError.result && <ResultDisplay data={unhandledError.result} traceId={unhandledError.traceId} />}
                </LabCard>
              </div>
            </LabSection></div>

          </div>
        </div>
      </div>
    </div>
  )
}
