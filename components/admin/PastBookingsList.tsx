'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface PastBookingItem {
  id: string
  equipmentId: string | null
  equipmentName: string | null
  addOnId: string | null
  addOnName: string | null
  quantity: number
}

interface PastBooking {
  id: string
  originalBookingId: string
  userId: string
  packageId: string | null
  packageName: string | null
  pickupDate: string
  returnDate: string
  totalPrice: number
  deposit: number
  originalStatus: string
  action: string
  actionBy: string | null
  actionReason: string | null
  deliveryOption: string
  inspectionCompleted: boolean
  depositRefunded: boolean
  lateFee: number
  createdAt: string
  updatedAt: string
  archivedAt: string
  pastBookingItems: PastBookingItem[]
}

interface PastBookingsResponse {
  pastBookings: PastBooking[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function PastBookingsList() {
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  const fetchPastBookings = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (actionFilter) params.set('action', actionFilter)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())

      const response = await fetch(`/api/admin/past-bookings?${params.toString()}`)
      if (response.ok) {
        const data: PastBookingsResponse = await response.json()
        setPastBookings(data.pastBookings)
        setPagination(data.pagination)
      } else {
        console.error('Failed to fetch past bookings:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching past bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPastBookings()
  }, [pagination.page, actionFilter, statusFilter])

  useEffect(() => {
    // Debounce search query
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchPastBookings()
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const actionColors = {
    deleted: 'bg-red-500/20 text-red-500 border-red-500/30',
    rejected: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  }

  const statusColors = {
    Pending: 'bg-yellow-500/20 text-yellow-500',
    Confirmed: 'bg-blue-500/20 text-blue-500',
    Active: 'bg-cyber-green/20 text-cyber-green',
    Completed: 'bg-gray-500/20 text-gray-400',
    Cancelled: 'bg-red-500/20 text-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by booking ID, package name, or equipment..."
                className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                >
                  <option value="">All Actions</option>
                  <option value="deleted">Deleted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Original Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || actionFilter || statusFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setActionFilter('')
                  setStatusFilter('')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-gray-400">
          Showing {pastBookings.length} of {pagination.total} past bookings
        </div>
      )}

      {/* Past Bookings List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading past bookings...</p>
        </div>
      ) : pastBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">No past bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pastBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        Booking #{booking.originalBookingId.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          actionColors[booking.action as keyof typeof actionColors] ||
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {booking.action === 'deleted' ? '🗑️ Deleted' : '❌ Rejected'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[booking.originalStatus as keyof typeof statusColors] ||
                          statusColors.Pending
                        }`}
                      >
                        Was: {booking.originalStatus}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Dates: {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                      {new Date(booking.returnDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Archived: {new Date(booking.archivedAt).toLocaleString()}
                    </p>
                    {booking.actionReason && (
                      <p className="text-orange-400 text-sm mt-1">
                        Reason: {booking.actionReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-neon-blue">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Deposit: {formatCurrency(booking.deposit)}
                    </p>
                    {booking.lateFee > 0 && (
                      <p className="text-sm text-red-400">
                        Late Fee: {formatCurrency(booking.lateFee)}
                      </p>
                    )}
                  </div>
                </div>

                {booking.packageName && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Package:</p>
                    <p className="text-white font-medium">{booking.packageName}</p>
                  </div>
                )}

                {booking.pastBookingItems.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Items:</p>
                    <div className="space-y-1">
                      {booking.pastBookingItems.map((item) => (
                        <div key={item.id} className="text-sm text-gray-300">
                          {item.equipmentName || item.addOnName} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Delivery: {booking.deliveryOption}</span>
                  {booking.inspectionCompleted && (
                    <span className="text-cyber-green">✓ Inspection Completed</span>
                  )}
                  {booking.depositRefunded && (
                    <span className="text-cyber-green">✓ Deposit Refunded</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPagination(prev => ({
                ...prev,
                page: Math.min(prev.totalPages, prev.page + 1),
              }))
            }
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

