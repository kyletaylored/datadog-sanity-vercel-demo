'use client'

import {useState} from 'react'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'leadCaptureForm'>
  index: number
  pageId: string
  pageType: string
}

const BG_CLASS: Record<string, string> = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-black text-white',
}

export default function LeadCaptureForm({block}: Props) {
  const {
    heading,
    subheading,
    ctaLabel = 'Get in touch',
    successMessage = "Thanks! We'll be in touch soon.",
    showCompany = true,
    showInterest = true,
    interestOptions = [],
    showMessage = false,
    background = 'gray',
    containerWidth = 'boxed',
  } = block

  const bgClass = BG_CLASS[background] ?? BG_CLASS.gray
  const isDark = background === 'dark'
  const innerClass = containerWidth === 'full' ? 'w-full px-6' : 'container mx-auto max-w-2xl px-6'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    interestedIn: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({...prev, [e.target.name]: e.target.value}))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const payload: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      source: typeof window !== 'undefined' ? window.location.pathname : '',
    }
    if (showCompany && formData.company) payload.company = formData.company
    if (showInterest && formData.interestedIn) payload.interestedIn = formData.interestedIn
    if (showMessage && formData.message) payload.message = formData.message

    try {
      const res = await fetch('/api/forms/lead', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        setErrorMsg((data as {error?: string}).error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  const inputClass = `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
    isDark
      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black'
  }`

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

  if (status === 'success') {
    return (
      <section className={`${bgClass} py-20`}>
        <div className={`${innerClass} text-center`}>
          <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {successMessage}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`${bgClass} py-20`}>
      <div className={innerClass}>
        {heading && (
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-center">{heading}</h2>
        )}
        {subheading && (
          <p className={`text-center mb-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subheading}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="lcf-name" className={labelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lcf-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lcf-email" className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="lcf-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className={inputClass}
              />
            </div>
          </div>

          {showCompany && (
            <div>
              <label htmlFor="lcf-company" className={labelClass}>
                Company
              </label>
              <input
                id="lcf-company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                className={inputClass}
              />
            </div>
          )}

          {showInterest && interestOptions.length > 0 && (
            <div>
              <label htmlFor="lcf-interest" className={labelClass}>
                Interested In
              </label>
              <select
                id="lcf-interest"
                name="interestedIn"
                value={formData.interestedIn}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select an option</option>
                {interestOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showMessage && (
            <div>
              <label htmlFor="lcf-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="lcf-message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your use case..."
                className={inputClass}
              />
            </div>
          )}

          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className={`w-full rounded-full py-3 px-6 text-sm font-semibold transition-colors disabled:opacity-60 ${
              isDark
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {status === 'submitting' ? 'Sending…' : ctaLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
