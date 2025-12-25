'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface DeleteBookingButtonProps {
  bookingId: string
  currentStatus: string
}

export function DeleteBookingButton({ bookingId, currentStatus }: DeleteBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [reason, setReason] = useState('')
  const router = useRouter()

  const handleDelete = async () => {
    if (!showReasonInput) {
      setShowReasonInput(true)
      return
    }

    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone and the booking will be moved to past bookings.')) {
      return
    }

    setIsLoading(true)
    try {
      // Use query parameter for reason since DELETE requests may not support bodies
      const url = new URL(`/api/admin/bookings/${bookingId}`, window.location.origin)
      if (reason) {
        url.searchParams.set('reason', reason)
      }
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.details || 'Failed to delete booking')
      }

      // Trigger calendar update
      window.dispatchEvent(new CustomEvent('bookingConfirmed'))
      localStorage.setItem('bookingUpdate', Date.now().toString())
      
      // Refresh current page or redirect to rentals
      if (window.location.pathname.includes('/rentals')) {
        router.push('/admin/rentals')
      }
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting booking:', error)
      const errorMessage = error?.message || 'Failed to delete booking. Please try again.'
      alert(errorMessage)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowReasonInput(false)
    setReason('')
  }

  if (showReasonInput) {
    return (
      <div className="space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for deletion (optional)"
          className="w-full px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? 'Deleting...' : 'Delete Booking'}
    </Button>
  )
}

