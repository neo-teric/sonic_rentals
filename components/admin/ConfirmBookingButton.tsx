'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface ConfirmBookingButtonProps {
  bookingId: string
  currentStatus: string
}

export function ConfirmBookingButton({ bookingId, currentStatus }: ConfirmBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    if (!confirm('Are you sure you want to confirm this booking? This will change its status to Confirmed.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Confirmed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm booking')
      }

      // Trigger a custom event to notify calendar to refresh
      // Use setTimeout to ensure the event fires after the API call completes
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('bookingConfirmed'))
      }, 100)
      
      // Also trigger a storage event for cross-tab updates
      localStorage.setItem('bookingUpdate', Date.now().toString())
      
      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Error confirming booking:', error)
      alert('Failed to confirm booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus !== 'Pending') {
    return null
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleConfirm}
      disabled={isLoading}
      className="bg-cyber-green hover:bg-green-400"
    >
      {isLoading ? 'Confirming...' : 'Confirm Booking'}
    </Button>
  )
}

