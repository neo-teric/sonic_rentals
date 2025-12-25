'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AccordionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function Accordion({ title, children, defaultOpen = false, className }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border border-gray-700 rounded-lg bg-deep-slate overflow-hidden shadow-lg', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-charcoal/50 transition-colors group"
      >
        <h3 className="text-xl md:text-2xl font-semibold text-white group-hover:text-neon-blue transition-colors">
          {title}
        </h3>
        <svg
          className={cn(
            'w-6 h-6 text-neon-blue transition-transform duration-300 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  )
}

