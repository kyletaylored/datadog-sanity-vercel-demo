'use client'

import {useState} from 'react'
import type {LucideIcon} from 'lucide-react'

export default function LabSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <span className="font-semibold text-gray-900">{title}</span>
        <svg
          className={`ml-auto w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="p-6 space-y-4 bg-white">{children}</div>}
    </div>
  )
}
