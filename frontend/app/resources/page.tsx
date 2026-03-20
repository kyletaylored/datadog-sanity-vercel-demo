import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {resourcesPostsQuery} from '@/sanity/lib/queries'
import ResourcesClient from './ResourcesClient'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Guides, case studies, and product news from the MarTech Pulse team.',
}

export default async function ResourcesPage() {
  const {data} = await sanityFetch({query: resourcesPostsQuery})

  return <ResourcesClient posts={data ?? []} />
}
