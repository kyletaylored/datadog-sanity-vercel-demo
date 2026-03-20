import type {Metadata} from 'next'
import Link from 'next/link'
import {Shield, Zap, Database, BarChart3, Globe, Lock} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Platform',
  description:
    'The MarTech Pulse platform — unified data, real-time segmentation, and campaign intelligence built for modern marketing teams.',
}

const features = [
  {
    icon: Database,
    title: 'Unified Data Layer',
    description:
      'Connect every source of customer truth — CRM, product analytics, ad platforms, and data warehouse — into a single continuously updated identity graph. No ETL pipelines, no overnight syncs.',
  },
  {
    icon: Zap,
    title: 'Real-Time Segmentation',
    description:
      'Build and activate audiences in milliseconds using behavioral signals, firmographic attributes, and predictive scores. Segment membership updates the instant a profile changes.',
  },
  {
    icon: BarChart3,
    title: 'Campaign Intelligence',
    description:
      'Multi-touch attribution across every channel with no data warehouse joins required. Measure true incremental lift and optimize spend allocation in real time.',
  },
  {
    icon: Globe,
    title: 'Omnichannel Activation',
    description:
      'Sync audiences to any destination — Google, Meta, LinkedIn, your ESP, your CDP, or a custom webhook — from a single segment definition. One change updates everywhere.',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description:
      'Consent management, data residency controls, and automatic PII masking built into the platform. GDPR, CCPA, and HIPAA-ready out of the box.',
  },
  {
    icon: Lock,
    title: 'Enterprise-Grade Security',
    description:
      'SOC 2 Type II certified, SSO via SAML 2.0 and OIDC, role-based access control, and audit logs for every data access event.',
  },
]

const tiers = [
  {
    name: 'Starter',
    price: '$299',
    per: 'per month',
    description: 'For growing marketing teams getting started with real-time data.',
    features: ['Up to 500K profiles', '10 segment definitions', '5 destinations', 'Email support'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$899',
    per: 'per month',
    description: 'For teams running multi-channel campaigns at scale.',
    features: [
      'Up to 5M profiles',
      'Unlimited segments',
      'Unlimited destinations',
      'Attribution reporting',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: 'contact us',
    description: 'Dedicated infrastructure, SLAs, and custom integrations.',
    features: [
      'Unlimited profiles',
      'Dedicated infrastructure',
      'Custom SLA',
      'SSO + advanced RBAC',
      'Dedicated CSM',
    ],
    cta: 'Talk to sales',
    highlight: false,
  },
]

export default function PlatformPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-5">
            The Platform Behind Every Customer Moment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            MarTech Pulse unifies your customer data, powers real-time segmentation, and activates
            audiences across every channel — all from one place.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
            Everything your team needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({icon: Icon, title, description}) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-center">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-12">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(({name, price, per, description, features, cta, highlight}) => (
              <div
                key={name}
                className={`rounded-xl border p-8 flex flex-col ${
                  highlight ? 'border-black bg-black text-white' : 'border-gray-200'
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-mono mb-1 ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                    {name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className={`text-sm ${highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                      {per}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                    {description}
                  </p>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className={highlight ? 'text-white' : 'text-gray-400'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/lab"
                  className={`text-center rounded-full py-3 px-6 text-sm font-semibold transition-colors ${
                    highlight
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
