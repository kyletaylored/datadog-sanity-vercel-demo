'use client'

import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

export default function MermaidDiagram({chart, caption}: {chart: string; caption?: string}) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({x: 0, y: 0})
  const [dragging, setDragging] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{mx: number; my: number; px: number; py: number} | null>(null)

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

  // Reset zoom/pan when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setZoom(1)
      setPan({x: 0, y: 0})
    }
  }, [modalOpen])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = {mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y}
    setDragging(true)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx) / zoom,
      y: dragStart.current.py + (e.clientY - dragStart.current.my) / zoom,
    })
  }

  const onMouseUp = () => {
    dragStart.current = null
    setDragging(false)
  }

  // Attach wheel listener as non-passive so preventDefault() actually works
  useEffect(() => {
    const el = canvasRef.current
    if (!el || !modalOpen) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom((z) => Math.min(4, Math.max(0.25, z - e.deltaY * 0.001)))
    }
    el.addEventListener('wheel', onWheel, {passive: false})
    return () => el.removeEventListener('wheel', onWheel)
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
            className="fixed inset-0 z-50 flex flex-col bg-gray-100"
            onClick={() => setModalOpen(false)}
          >
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-5 py-3 bg-white/95 border-b border-gray-200 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {caption && <span className="text-xs text-gray-500 truncate mr-4">{caption}</span>}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                  aria-label="Zoom out"
                >
                  −
                </button>
                <span className="text-xs text-gray-500 font-mono w-10 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({x: 0, y: 0}) }}
                  className="px-2.5 h-7 text-xs rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Reset
                </button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button
                  ref={closeRef}
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className={`flex-1 overflow-hidden select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-center w-full h-full [&>svg]:max-w-none"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center',
                  transition: dragging ? 'none' : 'transform 0.1s ease-out',
                }}
                dangerouslySetInnerHTML={svg ? {__html: svg} : undefined}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
