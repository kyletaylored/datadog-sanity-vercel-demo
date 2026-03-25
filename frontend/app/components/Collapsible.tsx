export default function Collapsible({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      open={defaultOpen}
      className="group my-4 rounded-lg border border-gray-200 overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer list-none text-sm font-medium text-gray-700 select-none">
        {summary}
        <svg
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 py-4 bg-white">{children}</div>
    </details>
  )
}
