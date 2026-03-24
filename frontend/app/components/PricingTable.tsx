import Link from 'next/link'
import {stegaClean} from '@sanity/client/stega'
import {ExtractPageBuilderType} from '@/sanity/lib/types'

type Props = {
  block: ExtractPageBuilderType<'pricingTable'>
  index: number
  pageId: string
  pageType: string
}

const BG_CLASS: Record<string, string> = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-black text-white',
}

export default function PricingTable({block}: Props) {
  const {heading, subheading, tiers = []} = block
  const background = stegaClean(block.background) ?? 'white'
  const containerWidth = stegaClean(block.containerWidth) ?? 'boxed'
  const bgClass = BG_CLASS[background] ?? BG_CLASS.white
  const innerClass = containerWidth === 'full' ? 'w-full px-6' : 'container mx-auto max-w-5xl px-6'

  return (
    <section className={`${bgClass} py-20`}>
      <div className={innerClass}>
        {heading && (
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-center">{heading}</h2>
        )}
        {subheading && (
          <p className="text-gray-500 text-center mb-12">{subheading}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier._key}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.highlighted ? 'border-black bg-black text-white' : 'border-gray-200'
              }`}
            >
              <div className="mb-6">
                <p
                  className={`text-sm font-mono mb-1 ${
                    tier.highlighted ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span
                    className={`text-sm ${tier.highlighted ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {tier.period}
                  </span>
                </div>
                {tier.description && (
                  <p
                    className={`mt-2 text-sm ${
                      tier.highlighted ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {tier.description}
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-8 flex-1">
                {(tier.features ?? []).map((feature, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 text-sm ${
                      tier.highlighted ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span className={tier.highlighted ? 'text-white' : 'text-gray-400'}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.ctaLabel && (
                <Link
                  href={tier.ctaHref ?? '/'}
                  className={`text-center rounded-full py-3 px-6 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {tier.ctaLabel}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
