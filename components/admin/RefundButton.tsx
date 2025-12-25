'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface RefundButtonProps {
  bookingId: string
}

export function RefundButton({ bookingId }: RefundButtonProps) {
  const [processing, setProcessing] = useState(false)

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to process the deposit refund?')) return

    setProcessing(true)

    try {
      const response = await fetch(`/api/admin/refunds/${bookingId}`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error processing refund:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Button
      variant="primary"
      className="w-full"
      onClick={handleRefund}
      disabled={processing}
    >
      {processing ? 'Processing...' : 'Process Deposit Refund'}
    </Button>
  )
}

