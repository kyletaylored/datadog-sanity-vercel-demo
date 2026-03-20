type Status = 'idle' | 'loading' | 'success' | 'error'

const config: Record<Status, {label: string; classes: string}> = {
  idle: {label: 'Ready', classes: 'bg-gray-100 text-gray-600'},
  loading: {label: 'Running...', classes: 'bg-blue-100 text-blue-700 animate-pulse'},
  success: {label: 'Success', classes: 'bg-green-100 text-green-700'},
  error: {label: 'Error', classes: 'bg-red-100 text-red-700'},
}

export default function StatusBadge({status}: {status: Status}) {
  const {label, classes} = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {status === 'loading' && (
        <svg className="mr-1.5 h-2 w-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </span>
  )
}
