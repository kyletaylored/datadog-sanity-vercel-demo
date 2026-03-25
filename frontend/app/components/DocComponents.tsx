import React from 'react'
import CodeBlock from './CodeBlock'

export function DocH2({id, children}: {id: string; children: React.ReactNode}) {
  return (
    <h2
      id={id}
      className="scroll-mt-32 text-xl font-bold mt-14 mb-4 pb-2 border-b border-gray-100 first:mt-0"
    >
      {children}
    </h2>
  )
}

export function DocH3({id, children}: {id?: string; children: React.ReactNode}) {
  return (
    <h3 id={id} className="scroll-mt-32 text-base font-semibold mt-8 mb-3">
      {children}
    </h3>
  )
}

export function DocH4({id, children}: {id?: string; children: React.ReactNode}) {
  return (
    <h4 id={id} className="scroll-mt-32 text-sm font-semibold mt-5 mb-2 text-gray-700">
      {children}
    </h4>
  )
}

export function DocCode({children}: {children: React.ReactNode}) {
  return (
    <code className="bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-[0.8em] font-mono">
      {children}
    </code>
  )
}

export function DocPre({
  filename,
  lang,
  children,
}: {
  filename?: string
  lang?: string
  children: React.ReactNode
}) {
  if (lang && typeof children === 'string') {
    return <CodeBlock code={children} lang={lang} filename={filename} />
  }
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-800 bg-gray-950">
      {filename && (
        <div className="bg-gray-800 text-gray-400 text-xs font-mono px-4 py-2 border-b border-gray-700">
          {filename}
        </div>
      )}
      <pre className="bg-gray-950 text-gray-100 text-sm font-mono overflow-x-auto p-4 leading-relaxed">
        {children}
      </pre>
    </div>
  )
}

export function DocNote({
  children,
  variant = 'warning',
}: {
  children: React.ReactNode
  variant?: 'warning' | 'info' | 'tip'
}) {
  const styles = {
    warning: 'border-yellow-400 bg-yellow-50 text-yellow-900',
    info: 'border-blue-400 bg-blue-50 text-blue-900',
    tip: 'border-green-500 bg-green-50 text-green-900',
  }
  const icons = {warning: '⚠', info: 'ℹ', tip: '✓'}
  return (
    <div className={`border-l-4 ${styles[variant]} px-4 py-3 text-sm my-4 rounded-r flex gap-2.5`}>
      <span className="shrink-0 font-mono text-xs mt-0.5 opacity-70">{icons[variant]}</span>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

export function DocEnvTable({rows}: {rows: [string, string, string][]}) {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left border-b border-gray-200">
            <th className="px-4 py-2.5 font-semibold text-gray-700 font-mono text-xs">Variable</th>
            <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs w-32">Required</th>
            <th className="px-4 py-2.5 font-semibold text-gray-700 text-xs">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, req, note]) => (
            <tr key={name} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-800 whitespace-nowrap">{name}</td>
              <td className="px-4 py-2.5 text-xs text-gray-600">{req}</td>
              <td className="px-4 py-2.5 text-xs text-gray-500">{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DocStep({n, children}: {n: number; children: React.ReactNode}) {
  return (
    <div className="flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed flex-1">{children}</div>
    </div>
  )
}
