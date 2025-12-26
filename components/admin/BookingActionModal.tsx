'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface BookingDetails {
  id: string
  status: string
  pickupDate: string
  returnDate: string
  totalPrice: number
  deposit: number
  deliveryOption: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  package?: {
    name: string
    idealFor: string
  } | null
  bookingItems: Array<{
    id: string
    quantity: number
    equipment?: {
      id: string
      name: string
      category: string
    } | null
    addOn?: {
      id: string
      name: string
      category: string
      price: number
    } | null
  }>
}

interface BookingActionModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
  onActionComplete: () => void
}

export function BookingActionModal({
  isOpen,
  onClose,
  bookingId,
  onActionComplete,
}: BookingActionModalProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [showDeleteReason, setShowDeleteReason] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    if (isOpen && bookingId) {
      console.log('BookingActionModal: Modal opened, bookingId:', bookingId, 'isOpen:', isOpen)
      fetchBookingDetails()
    } else {
      setBooking(null)
      setShowDeleteReason(false)
      setDeleteReason('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookingId])

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      console.error('BookingActionModal: No bookingId provided')
      return
    }
    
    console.log('BookingActionModal: Starting fetch for booking:', bookingId)
    setIsLoading(true)
    try {
      const url = `/api/admin/bookings/${bookingId}`
      console.log('BookingActionModal: Fetching from URL:', url)
      const response = await fetch(url)
      console.log('BookingActionModal: Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('BookingActionModal: Successfully fetched booking:', data.id, data.status)
        setBooking(data)
      } else {
        // Try to parse error response, but handle if it's not JSON
        let errorData: { error?: string } | null = null
        const status = response.status
        const statusText = response.statusText
        
        try {
          // Try to parse as JSON first
          const text = await response.text()
          try {
            errorData = JSON.parse(text)
            console.log('BookingActionModal: Error response JSON:', errorData)
          } catch {
            // Not valid JSON, use text as error message
            errorData = { error: text || statusText || `Error ${status}` }
            console.log('BookingActionModal: Error response text:', text)
          }
        } catch (readError) {
          // Couldn't read response body, use status text
          errorData = { error: statusText || `Error ${status}` }
          console.log('BookingActionModal: Could not read error response')
        }
        
        const errorMsg = errorData?.error || `Failed to load booking details (${status})`
        console.error('BookingActionModal: Failed to fetch booking details - Status:', status, 'Error:', errorMsg, 'BookingId:', bookingId)
        alert(errorMsg)
        onClose()
      }
    } catch (error) {
      console.error('BookingActionModal: Error fetching booking:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        bookingId
      })
      alert(`Failed to load booking details: ${error instanceof Error ? error.message : 'Unknown error'}`)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!booking) return
    
    if (!confirm('Are you sure you want to confirm this booking? This will change its status to Confirmed.')) {
      return
    }

    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Confirmed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm booking')
      }

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('bookingConfirmed'))
      localStorage.setItem('bookingUpdate', Date.now().toString())
      
      onActionComplete()
      onClose()
    } catch (error) {
      console.error('Error confirming booking:', error)
      alert('Failed to confirm booking. Please try again.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!booking) return

    if (!showDeleteReason) {
      setShowDeleteReason(true)
      return
    }

    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone and the booking will be moved to past bookings.')) {
      return
    }

    setIsActionLoading(true)
    try {
      const url = new URL(`/api/admin/bookings/${booking.id}`, window.location.origin)
      if (deleteReason) {
        url.searchParams.set('reason', deleteReason)
      }
      
      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.details || 'Failed to delete booking')
      }

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('bookingConfirmed'))
      localStorage.setItem('bookingUpdate', Date.now().toString())
      
      onActionComplete()
      onClose()
    } catch (error: any) {
      console.error('Error deleting booking:', error)
      const errorMessage = error?.message || 'Failed to delete booking. Please try again.'
      alert(errorMessage)
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-400'
      case 'Confirmed':
        return 'text-blue-400'
      case 'Active':
        return 'text-cyber-green'
      case 'Completed':
        return 'text-gray-400'
      default:
        return 'text-white'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      size="lg"
    >
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading booking details...</p>
        </div>
      ) : booking ? (
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-deep-slate rounded-lg border border-gray-700">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Booking ID</p>
              <p className="text-sm text-white font-mono">{booking.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Pickup Date</p>
              <p className="text-white font-semibold">{formatDate(booking.pickupDate)}</p>
            </div>
            <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Return Date</p>
              <p className="text-white font-semibold">{formatDate(booking.returnDate)}</p>
            </div>
          </div>

          {/* Package or Equipment */}
          {booking.package ? (
            <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Package</p>
              <p className="text-white font-semibold">{booking.package.name}</p>
              <p className="text-sm text-gray-300 mt-1">{booking.package.idealFor}</p>
            </div>
          ) : null}

          {/* Equipment & Add-ons */}
          {booking.bookingItems && booking.bookingItems.length > 0 && (
            <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Items</p>
              <div className="space-y-2">
                {booking.bookingItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      {item.equipment ? (
                        <span className="text-white">
                          {item.equipment.name} <span className="text-gray-400">({item.equipment.category})</span>
                          {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                        </span>
                      ) : item.addOn ? (
                        <span className="text-white">
                          {item.addOn.name} <span className="text-gray-400">({item.addOn.category})</span>
                          {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                        </span>
                      ) : null}
                    </div>
                    {item.addOn && (
                      <span className="text-neon-blue">{formatCurrency(item.addOn.price)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          {(booking.customerName || booking.customerEmail || booking.customerPhone) && (
            <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Customer Information</p>
              <div className="space-y-1 text-sm">
                {booking.customerName && (
                  <p className="text-white"><span className="text-gray-400">Name:</span> {booking.customerName}</p>
                )}
                {booking.customerEmail && (
                  <p className="text-white"><span className="text-gray-400">Email:</span> {booking.customerEmail}</p>
                )}
                {booking.customerPhone && (
                  <p className="text-white"><span className="text-gray-400">Phone:</span> {booking.customerPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Total Price</span>
              <span className="text-white font-semibold text-lg">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Deposit (50%)</span>
              <span className="text-gray-300">{formatCurrency(booking.deposit)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-400">Delivery</span>
              <span className="text-gray-300">{booking.deliveryOption}</span>
            </div>
          </div>

          {/* Delete Reason Input */}
          {showDeleteReason && (
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <label className="block text-sm font-medium text-white mb-2">
                Reason for Deletion (Optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                className="w-full px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            {booking.status === 'Pending' && (
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={isActionLoading}
                className="flex-1 bg-cyber-green hover:bg-green-400"
              >
                {isActionLoading ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isActionLoading}
              className="flex-1"
            >
              {isActionLoading 
                ? 'Processing...' 
                : showDeleteReason 
                ? 'Confirm Delete' 
                : 'Delete Booking'}
            </Button>
            {showDeleteReason && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteReason(false)
                  setDeleteReason('')
                }}
                disabled={isActionLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Booking not found</p>
        </div>
      )}
    </Modal>
  )
}

