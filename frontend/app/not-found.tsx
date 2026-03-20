import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-xl px-6 py-40 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="rounded-full px-6 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
      >
        Return home
      </Link>
    </div>
  )
}
