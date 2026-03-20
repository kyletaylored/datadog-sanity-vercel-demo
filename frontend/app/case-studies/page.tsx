import type {Metadata} from 'next'
import Link from 'next/link'
import {sanityFetch} from '@/sanity/lib/live'
import {resourcesPostsQuery} from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'See how leading marketing teams use MarTech Pulse to grow faster.',
}

const stats = [
  {value: '40%', label: 'Average reduction in customer acquisition cost'},
  {value: '28%', label: 'Average lift in email click-through rate'},
  {value: '<50ms', label: 'Segment activation latency'},
  {value: '500+', label: 'Marketing teams on the platform'},
]

export default async function CaseStudiesPage() {
  const {data} = await sanityFetch({query: resourcesPostsQuery})
  const posts = data ?? []
  const caseStudies = posts.filter((p) => p.category === 'Case Study')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-5">
            Real teams. Real results.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how leading marketing teams use MarTech Pulse to reduce acquisition costs, increase
            engagement, and move faster than their competition.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-gray-100 bg-gray-50 py-10">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({value, label}) => (
              <div key={label}>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="mt-1 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case study posts from Sanity */}
      <div className="bg-white py-20">
        <div className="container mx-auto max-w-5xl px-6">
          {caseStudies.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-20">
              No case studies published yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {caseStudies.map((post) => (
                <Link
                  key={post._id}
                  href={`/posts/${post.slug}`}
                  className="group block rounded-xl border border-gray-200 p-8 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Case Study
                    </span>
                    {post.readTime && (
                      <span className="text-xs text-gray-400">{post.readTime} min read</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mb-3 group-hover:underline">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-medium">Read case study →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
