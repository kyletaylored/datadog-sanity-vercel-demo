import {BRAND} from '@/lib/brand'

export default function Footer() {
  return (
    <footer className="bg-gray-50 relative">
      <div className="absolute inset-0 bg-[url(/images/tile-grid-black.png)] bg-size-[17px] opacity-20 bg-position-[0_1]" />
      <div className="container relative">
        <div className="flex flex-col items-center py-28 lg:flex-row">
          <div className="mb-10 lg:mb-0 lg:w-1/2 lg:pr-4">
            <h3 className="text-center text-4xl font-mono leading-tight tracking-tighter lg:text-left lg:text-2xl">
              {BRAND.name}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500 lg:text-left">{BRAND.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-4 items-center justify-center lg:w-1/2 lg:justify-end lg:pl-4">
            {BRAND.footerLinks.map((link) => (
              <a key={link} href="#" className="text-sm font-mono text-gray-600 hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
