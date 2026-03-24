import type {LucideProps} from 'lucide-react'
import type {FC} from 'react'
import * as Icons from 'lucide-react'
import {stegaClean} from '@sanity/client/stega'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'featureGrid'>
  index: number
  pageId: string
  pageType: string
}

type IconName = NonNullable<
  NonNullable<ExtractPageBuilderType<'featureGrid'>['items']>[number]['icon']
>

const ICON_MAP: Record<IconName, FC<LucideProps>> = {
  Activity: Icons.Activity,
  BarChart3: Icons.BarChart3,
  Bell: Icons.Bell,
  Check: Icons.Check,
  Code: Icons.Code,
  Cpu: Icons.Cpu,
  Database: Icons.Database,
  Eye: Icons.Eye,
  FileText: Icons.FileText,
  Filter: Icons.Filter,
  GitBranch: Icons.GitBranch,
  Globe: Icons.Globe,
  Key: Icons.Key,
  Layers: Icons.Layers,
  Lock: Icons.Lock,
  Map: Icons.Map,
  Monitor: Icons.Monitor,
  Package: Icons.Package,
  Search: Icons.Search,
  Server: Icons.Server,
  Settings: Icons.Settings,
  Shield: Icons.Shield,
  Sliders: Icons.Sliders,
  Star: Icons.Star,
  Tag: Icons.Tag,
  Terminal: Icons.Terminal,
  Truck: Icons.Truck,
  Users: Icons.Users,
  Workflow: Icons.Workflow,
  Zap: Icons.Zap,
}

const COL_CLASS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
}

const BG_CLASS: Record<string, string> = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-black text-white',
}

export default function FeatureGrid({block}: Props) {
  const {heading, subheading, columns = 3, items = []} = block
  const background = stegaClean(block.background) ?? 'gray'
  const containerWidth = stegaClean(block.containerWidth) ?? 'boxed'
  const colClass = COL_CLASS[columns] ?? COL_CLASS[3]
  const bgClass = BG_CLASS[background] ?? BG_CLASS.gray
  const innerClass = containerWidth === 'full' ? 'w-full px-6' : 'container mx-auto max-w-5xl px-6'

  return (
    <section className={`${bgClass} py-20`}>
      <div className={innerClass}>
        {heading && (
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">{heading}</h2>
        )}
        {subheading && (
          <p className="text-gray-500 text-center mb-12">{subheading}</p>
        )}
        <div className={`grid grid-cols-1 ${colClass} gap-8 ${heading || subheading ? '' : 'mt-0'}`}>
          {items.map((item) => {
            const Icon = item.icon ? ICON_MAP[item.icon] : null
            return (
              <div
                key={item._key}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {Icon && (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                )}
                {item.title && <h3 className="font-semibold mb-2">{item.title}</h3>}
                {item.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                )}
                {item.href && (
                  <a href={item.href} className="mt-4 inline-block text-sm font-medium hover:underline">
                    Learn more →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
