import type {Metadata} from 'next'
import {Globe, Users, GitBranch} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'MarTech Pulse solutions for modern marketing teams.',
}

const solutions = [
  {
    icon: Globe,
    title: 'Customer Data Platform',
    description: 'Unify profiles across every source — CRM, product analytics, ad platforms, and more — into a single queryable identity graph.',
    href: '#',
  },
  {
    icon: Users,
    title: 'Audience Segmentation',
    description: 'Build and activate real-time audiences using behavioral, firmographic, and intent signals without waiting on engineering.',
    href: '#',
  },
  {
    icon: GitBranch,
    title: 'Campaign Orchestration',
    description: 'Coordinate cross-channel journeys across email, push, in-app, paid, and SMS with a single drag-and-drop canvas.',
    href: '#',
  },
]

export default function SolutionsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-20">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Solutions</h1>
        <p className="mt-4 text-lg text-gray-600">
          Everything your team needs to orchestrate the customer journey.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {solutions.map(({icon: Icon, title, description, href}) => (
          <div key={title} className="rounded-xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="mb-4 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-700" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            <a href={href} className="mt-4 inline-block text-sm font-medium hover:underline">
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
