interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export default function Spinner({ size = 'md', className = '', label = 'Loading...' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={['flex items-center justify-center', className].filter(Boolean).join(' ')}
    >
      <div className={['spinner', sizeClasses[size]].join(' ')} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
