import StatusBadge from './StatusBadge'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function LabCard({
  title,
  description,
  status = 'idle',
  children,
}: {
  title: string
  description: string
  status?: Status
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {children}
    </div>
  )
}
