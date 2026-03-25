'use client'

import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export default function MermaidDiagram({chart, caption}: {chart: string; caption?: string}) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let cancelled = false
    import('mermaid').then((m) => {
      if (cancelled) return
      m.default.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#f9fafb',
          primaryBorderColor: '#d1d5db',
          primaryTextColor: '#111827',
          lineColor: '#9ca3af',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#ffffff',
          fontSize: '13px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        },
      })
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      m.default
        .render(id, chart)
        .then(({svg: rendered}) => {
          if (!cancelled) setSvg(rendered)
        })
        .catch((err) => {
          if (!cancelled) setError(String(err))
        })
    })
    return () => {
      cancelled = true
    }
  }, [chart])

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  if (error) {
    return (
      <div className="text-xs text-red-500 font-mono p-3 bg-red-50 rounded border border-red-200">
        Diagram error: {error}
      </div>
    )
  }

  return (
    <>
      <figure className="my-2">
        <div
          className="flex justify-center overflow-x-auto py-4 px-2 [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={svg ? {__html: svg} : undefined}
        />
        <figcaption className="flex items-center justify-between mt-1 px-1">
          {caption && <span className="text-xs text-gray-400">{caption}</span>}
          {svg && (
            <button
              onClick={() => setModalOpen(true)}
              className="ml-auto text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Expand
            </button>
          )}
        </figcaption>
      </figure>

      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeRef}
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div
                className="flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={svg ? {__html: svg} : undefined}
              />
              {caption && (
                <p className="text-center text-xs text-gray-400 mt-4">{caption}</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
