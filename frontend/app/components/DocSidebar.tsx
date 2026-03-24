'use client'

import {useState, useEffect} from 'react'

export type DocSidebarItem = {
  id: string
  label: string
  children?: {id: string; label: string}[]
}

export default function DocSidebar({sections}: {sections: DocSidebarItem[]}) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const allIds = sections.flatMap((s) => [s.id, ...(s.children?.map((c) => c.id) ?? [])])

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) {
          setActive(intersecting[0].target.id)
        }
      },
      // -104px top offset accounts for the fixed 96px header + a little breathing room
      {rootMargin: '-104px 0px -40% 0px', threshold: 0},
    )

    allIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})
  }

  return (
    <nav className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 text-sm">
        {sections.map(({id, label, children}) => (
          <li key={id}>
            <button
              onClick={() => scrollTo(id)}
              className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                active === id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
            {children && (
              <ul className="ml-2 mt-0.5 mb-1 space-y-0.5 border-l border-gray-100 pl-3">
                {children.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => scrollTo(c.id)}
                      className={`w-full text-left px-2 py-1 rounded transition-colors text-xs ${
                        active === c.id
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
