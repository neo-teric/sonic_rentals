import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'popular' | 'easy-setup' | 'new' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    popular: 'bg-neon-blue text-charcoal',
    'easy-setup': 'bg-cyber-green text-charcoal',
    new: 'bg-purple-500 text-white',
    default: 'bg-gray-600 text-gray-200',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

