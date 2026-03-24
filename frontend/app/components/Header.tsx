'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState} from 'react'
import {BRAND} from '@/lib/brand'

export default function Header() {
  const pathname = usePathname()
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="fixed z-50 h-24 inset-0 bg-white/80 flex items-center backdrop-blur-lg">
      <div className="container py-6 px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/">
            <span className="text-lg sm:text-2xl pl-2 font-semibold">
              {BRAND.name}
            </span>
          </Link>

          <nav>
            <ul
              role="list"
              className="flex items-center gap-4 md:gap-6 leading-5 text-xs sm:text-base tracking-tight font-mono"
            >
              {BRAND.nav.map((item) => {
                const active = isActive(item.href)
                const hasChildren = 'children' in item && item.children.length > 0
                const isLab = item.label.includes('Signal Lab')

                if (isLab) {
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`rounded-full flex items-center py-2 px-4 sm:py-3 sm:px-6 text-white transition-colors duration-200 whitespace-nowrap ${
                          active ? 'bg-blue-700' : 'bg-black hover:bg-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                }

                if (hasChildren) {
                  const anyChildActive = item.children.some((c) => isActive(c.href))
                  return (
                    <li
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => setResourcesOpen(true)}
                      onMouseLeave={() => setResourcesOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className={`hover:underline ${active || anyChildActive ? 'underline font-semibold' : ''}`}
                      >
                        {item.label}
                      </Link>
                      {resourcesOpen && (
                        <ul className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-36 z-50">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={`block px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap ${
                                  isActive(child.href) ? 'font-semibold' : ''
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`hover:underline ${active ? 'underline font-semibold' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
