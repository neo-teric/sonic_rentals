'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface RejectBookingButtonProps {
  bookingId: string
  currentStatus: string
}

export function RejectBookingButton({ bookingId, currentStatus }: RejectBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [reason, setReason] = useState('')
  const router = useRouter()

  const handleReject = async () => {
    if (!showReasonInput) {
      setShowReasonInput(true)
      return
    }

    if (!confirm('Are you sure you want to reject this booking? This action cannot be undone and the booking will be moved to past bookings.')) {
      return
    }

    setIsLoading(true)
    try {
      console.log('Rejecting booking:', bookingId, 'Reason:', reason || 'none')
      
      const response = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || null }),
      })

      console.log('Reject response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Reject error response:', errorData)
        throw new Error(errorData.error || errorData.details || `Failed to reject booking (${response.status})`)
      }

      const result = await response.json()
      console.log('Reject booking successful:', result)

      // Trigger calendar update
      window.dispatchEvent(new CustomEvent('bookingConfirmed'))
      localStorage.setItem('bookingUpdate', Date.now().toString())
      
      // Show success message
      alert('Booking rejected successfully and moved to past bookings.')
      
      // Redirect to rentals page
      window.location.href = '/admin/rentals'
    } catch (error: any) {
      console.error('Error rejecting booking:', error)
      const errorMessage = error?.message || 'Failed to reject booking. Please try again.'
      alert(`Error: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowReasonInput(false)
    setReason('')
  }

  if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
    return null
  }

  if (showReasonInput) {
    return (
      <div className="space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)"
          className="w-full px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReject}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Rejecting...' : 'Confirm Reject'}
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
      onClick={handleReject}
      disabled={isLoading}
    >
      {isLoading ? 'Rejecting...' : 'Reject Booking'}
    </Button>
  )
}

