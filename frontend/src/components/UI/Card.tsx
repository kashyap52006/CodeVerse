import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  compact?: boolean
}

export default function Card({ children, className = '', compact = false }: CardProps) {
  return (
    <div className={[compact ? 'card-compact' : 'card', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
