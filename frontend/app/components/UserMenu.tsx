'use client'

import {useState, useEffect, useRef} from 'react'
import {datadogRum} from '@datadog/browser-rum'

type User = {email: string; name: string; avatarUrl: string}

const STORAGE_KEY = 'demo_user'

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Restore session and identify user in RUM on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const u: User = JSON.parse(stored)
        setUser(u)
        datadogRum.setUser({id: u.email, name: u.name, email: u.email})
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, name}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }
      const u: User = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      setUser(u)
      datadogRum.setUser({id: u.email, name: u.name, email: u.email})
      setOpen(false)
      setEmail('')
      setName('')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', {method: 'POST'})
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    datadogRum.setUser({})
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex items-center">
      {user ? (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full hover:bg-gray-100 pl-1 pr-3 py-1 transition-colors"
            aria-label="Account menu"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border border-gray-200"
            />
            <span className="text-sm font-medium max-w-24 truncate hidden sm:block">{user.name}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-sm font-medium hover:underline px-2 py-1"
          >
            Sign in
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
              <h3 className="text-sm font-semibold mb-3">Sign in</h3>
              <form onSubmit={login} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="text"
                  placeholder="Display name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-3">
                Demo only — any email works. Avatar pulled from Gravatar.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
