import type {Metadata} from 'next'
import Link from 'next/link'
import ApiDocsClient from './ApiDocsClient'

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'OpenAPI 3.1 reference for all Signal Lab and application API endpoints.',
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="mb-6 text-sm font-mono text-gray-400">
          <Link href="/" className="hover:underline">Home</Link>
          {' '}/ <Link href="/lab" className="hover:underline">Signal Lab</Link>
          {' '}/ <span className="text-gray-600">API Reference</span>
        </p>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">API Reference</h1>
          <a
            href="/api/openapi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 rounded px-2.5 py-1 transition-colors"
          >
            openapi.json ↗
          </a>
        </div>
        <p className="text-gray-500 mb-8 text-sm">
          All routes produce OTel spans and structured JSON logs. Responses include a{' '}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">traceId</code> field
          for cross-referencing in Datadog APM.
        </p>

        {/* Swagger UI — loaded client-side only to avoid SSR issues */}
        <div className="swagger-wrapper rounded-xl border border-gray-200 overflow-hidden">
          <ApiDocsClient />
        </div>
      </div>

      {/* Scope swagger-ui styles to avoid bleeding into the rest of the page */}
      <style>{`
        .swagger-wrapper .swagger-ui .topbar { display: none; }
        .swagger-wrapper .swagger-ui { font-family: inherit; }
        .swagger-wrapper .swagger-ui .info { margin: 20px 0 10px; }
        .swagger-wrapper .swagger-ui .info .title { font-size: 1.5rem; }
        .swagger-wrapper .swagger-ui .scheme-container { display: none; }
      `}</style>
    </div>
  )
}
