'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState, useEffect, useRef} from 'react'
import {BRAND} from '@/lib/brand'
import UserMenu from '@/app/components/UserMenu'

export default function Header() {
  const pathname = usePathname()
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <header className="fixed z-50 inset-x-0 top-0 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link className="flex items-center gap-2 shrink-0" href="/">
            <span className="text-lg sm:text-xl font-semibold">{BRAND.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 leading-5 text-sm tracking-tight font-mono">
            {BRAND.nav.map((item) => {
              const active = isActive(item.href)
              const hasChildren = 'children' in item && item.children.length > 0
              const isLab = item.label.includes('Signal Lab')

              if (isLab) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full flex items-center py-2 px-5 text-white transition-colors duration-200 whitespace-nowrap ${
                      active ? 'bg-blue-700' : 'bg-black hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              }

              if (hasChildren) {
                const anyChildActive = item.children.some((c) => isActive(c.href))
                return (
                  <div
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
                      <div className="absolute left-0 top-full pt-1 z-50">
                        <ul className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-36">
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
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:underline ${active ? 'underline font-semibold' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <UserMenu />
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`block w-5 h-0.5 bg-gray-800 transition-transform duration-200 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-800 transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-gray-800 transition-transform duration-200 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="container px-4 py-4 flex flex-col gap-1 font-mono text-sm">
            {BRAND.nav.map((item) => {
              const active = isActive(item.href)
              const hasChildren = 'children' in item && item.children.length > 0
              const isLab = item.label.includes('Signal Lab')

              if (isLab) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-center py-3 px-5 rounded-xl text-white font-medium mt-2 ${
                      active ? 'bg-blue-700' : 'bg-black'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              }

              if (hasChildren) {
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-2.5 px-3 rounded-lg hover:bg-gray-50 ${active ? 'font-semibold' : 'text-gray-700'}`}
                    >
                      {item.label}
                    </Link>
                    <div className="ml-4 flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 px-3 rounded-lg text-xs hover:bg-gray-50 text-gray-500 ${
                            isActive(child.href) ? 'font-semibold text-gray-900' : ''
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2.5 px-3 rounded-lg hover:bg-gray-50 ${
                    active ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
