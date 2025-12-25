import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-charcoal'
  
  const variants = {
    primary: 'bg-neon-blue text-charcoal hover:bg-cyan-400 focus:ring-neon-blue',
    secondary: 'bg-cyber-green text-charcoal hover:bg-green-400 focus:ring-cyber-green',
    outline: 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-charcoal focus:ring-neon-blue',
    ghost: 'text-gray-300 hover:bg-deep-slate hover:text-white focus:ring-gray-400',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const classes = cn(baseStyles, variants[variant], sizes[size], className)
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

