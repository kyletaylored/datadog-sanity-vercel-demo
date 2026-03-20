import Link from 'next/link'
import {BRAND} from '@/lib/brand'

export default function Header() {
  return (
    <header className="fixed z-50 h-24 inset-0 bg-white/80 flex items-center backdrop-blur-lg">
      <div className="container py-6 px-2 sm:px-6">
        <div className="flex items-center justify-between gap-5">
          <Link className="flex items-center gap-2" href="/">
            <span className="text-lg sm:text-2xl pl-2 font-semibold">
              {BRAND.name}
            </span>
          </Link>

          <nav>
            <ul
              role="list"
              className="flex items-center gap-4 md:gap-6 leading-5 text-xs sm:text-base tracking-tight font-mono"
            >
              {BRAND.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      item.label.includes('Signal Lab')
                        ? 'rounded-full flex items-center bg-black hover:bg-blue focus:bg-blue py-2 px-4 sm:py-3 sm:px-6 text-white transition-colors duration-200 whitespace-nowrap'
                        : 'hover:underline'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
