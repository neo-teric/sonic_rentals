'use client'

import { ReactNode, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className={cn('relative z-10 w-full', sizeClasses[size], className)}>
        <Card className="border-neon-blue/30 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

