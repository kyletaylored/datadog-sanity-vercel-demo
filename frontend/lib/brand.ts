export const BRAND = {
  name: 'MarTech Pulse',
  tagline: 'Orchestrate Every Customer Moment',
  description:
    'The open platform for modern marketing teams — unified data, real-time segmentation, and campaign intelligence.',
  nav: [
    {label: 'Platform', href: '/platform'},
    {label: 'Solutions', href: '/solutions'},
    {
      label: 'Resources',
      href: '/resources',
      children: [{label: 'Case Studies', href: '/case-studies'}],
    },
    {label: 'Setup Guide', href: '/setup'},
    {label: '⚡ Signal Lab', href: '/lab'},
  ],
  footerLinks: ['Privacy', 'Terms', 'Security', 'Status'],
  socialProof: ['Acme Corp', 'Globex', 'Initech', 'Umbrella Co', 'Hooli'],
} as const
