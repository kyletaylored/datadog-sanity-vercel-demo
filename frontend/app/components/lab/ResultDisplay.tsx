'use client'

import {useState} from 'react'
import CopyButton from '@/app/components/CopyButton'

export default function ResultDisplay({
  data,
  traceId,
}: {
  data: unknown
  traceId?: string
}) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  const handleCopyTrace = () => {
    if (traceId) {
      navigator.clipboard.writeText(traceId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mt-3">
      <div className="relative group rounded-lg overflow-hidden border border-gray-800">
        <CopyButton code={json} />
        <pre className="bg-gray-950 text-green-400 text-xs p-4 overflow-auto max-h-64 whitespace-pre-wrap break-words">
          {json}
        </pre>
      </div>
      {traceId && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-mono">
          <span>Trace ID: {traceId}</span>
          <button
            onClick={handleCopyTrace}
            className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
