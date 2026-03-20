'use client'

import {useState} from 'react'
import Link from 'next/link'

type Post = {
  _id: string
  title: string
  slug: string | null
  excerpt?: string | null
  date?: string | null
  category?: string | null
  readTime?: number | null
  author?: {firstName?: string | null; lastName?: string | null} | null
}

const CATEGORIES = ['All', 'Product', 'Tutorial', 'Case Study', 'News', 'Company']

export default function ResourcesClient({posts}: {posts: Post[]}) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory)

  return (
    <div className="container mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Resources</h1>
        <p className="mt-3 text-gray-600">
          Guides, case studies, and product news from the MarTech Pulse team.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-mono border transition-colors ${
              activeCategory === cat
                ? 'bg-black text-white border-black'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No posts in this category yet.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((post) => (
            <article
              key={post._id}
              className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {post.category && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {post.category}
                      </span>
                    )}
                    {post.readTime && (
                      <span className="text-xs text-gray-400">{post.readTime} min read</span>
                    )}
                  </div>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group"
                  >
                    <h2 className="text-xl font-semibold group-hover:underline">{post.title}</h2>
                  </Link>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.author && (
                    <p className="mt-3 text-xs text-gray-400">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
