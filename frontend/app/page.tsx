import {Suspense} from 'react'
import Link from 'next/link'
import {Database, Zap, BarChart3} from 'lucide-react'

import {AllPosts} from '@/app/components/Posts'
import {BRAND} from '@/lib/brand'

export default async function Page() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-size-[5px]">
          <div className="bg-gradient-to-b from-white w-full h-full absolute top-0"></div>
          <div className="container">
            <div className="relative min-h-[50vh] mx-auto max-w-4xl pt-10 xl:pt-20 pb-20 space-y-8 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-black">
                {BRAND.tagline}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                {BRAND.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/lab"
                  className="rounded-full px-8 py-4 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                >
                  Start Free Trial
                </Link>
                <a
                  href="#features"
                  className="rounded-full px-8 py-4 border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
                >
                  See It In Action
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Database className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold">Unified Data Layer</h3>
              <p className="text-gray-600">Connect every source of customer truth into a single, queryable profile.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Segmentation</h3>
              <p className="text-gray-600">Build and activate audiences in milliseconds, not hours.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold">Campaign Intelligence</h3>
              <p className="text-gray-600">Measure what matters with attribution that spans every touchpoint.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="container mx-auto max-w-6xl px-6">
          <p className="text-center text-sm text-gray-500 mb-6">Trusted by leading marketing teams</p>
          <div className="flex flex-wrap justify-center gap-4">
            {BRAND.socialProof.map((company) => (
              <span
                key={company}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-mono text-gray-600 bg-white"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container">
          <aside className="py-12 sm:py-20">
            <Suspense>{await AllPosts()}</Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
