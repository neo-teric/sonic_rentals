'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface Booking {
  id: string
  status: string
  pickupDate: string
  returnDate: string
  totalPrice: number
  package?: { name: string } | null
  bookingItems: Array<{ id: string; equipment?: { name: string } | null; addOn?: { name: string } | null }>
}

export function CalendarView() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      // Add timestamp to prevent caching
      const response = await fetch(`/api/admin/calendar?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
        setLastUpdate(new Date())
      } else {
        console.error('Failed to fetch calendar bookings:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching calendar bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    
    // Listen for booking confirmation events
    const handleBookingConfirmed = () => {
      // Add a small delay to ensure the database update has completed
      setTimeout(() => {
        fetchBookings()
      }, 200)
    }
    
    // Listen for storage events (when booking is confirmed from another tab/page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookingUpdate') {
        fetchBookings()
      }
    }
    
    window.addEventListener('bookingConfirmed', handleBookingConfirmed)
    window.addEventListener('storage', handleStorageChange)
    
    // Also poll for updates every 3 seconds
    const interval = setInterval(fetchBookings, 3000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('bookingConfirmed', handleBookingConfirmed)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Group bookings by date
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const pickupDate = new Date(booking.pickupDate).toISOString().split('T')[0]
    const returnDate = new Date(booking.returnDate).toISOString().split('T')[0]
    
    // Add to pickup date
    if (!acc[pickupDate]) {
      acc[pickupDate] = []
    }
    acc[pickupDate].push({ ...booking, type: 'pickup' as const })
    
    // Add to return date
    if (!acc[returnDate]) {
      acc[returnDate] = []
    }
    acc[returnDate].push({ ...booking, type: 'return' as const })
    
    return acc
  }, {} as Record<string, Array<Booking & { type: 'pickup' | 'return' }>>)

  const statusColors = {
    Confirmed: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    Active: 'bg-cyber-green/20 text-cyber-green border-cyber-green/30',
    Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh'}
        </Button>
        {lastUpdate && (
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      {isLoading && bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading calendar...</p>
        </div>
      ) : (
        <>
          {Object.entries(bookingsByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, dateBookings]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-xl">
                {(() => {
                  // Parse date string directly (format: YYYY-MM-DD)
                  const [year, month, day] = date.split('-').map(Number)
                  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                  
                  // Calculate weekday using Zeller's congruence to avoid timezone issues
                  let y = year
                  let m = month
                  if (m < 3) {
                    m += 12
                    y -= 1
                  }
                  const k = y % 100
                  const j = Math.floor(y / 100)
                  const weekday = (day + Math.floor(13 * (m + 1) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7
                  // Adjust for modulo result (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
                  const weekdayIndex = weekday === 0 ? 6 : weekday - 1
                  
                  return `${weekdays[weekdayIndex]}, ${months[month - 1]} ${day}, ${year}`
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dateBookings.map((booking) => (
                  <div
                    key={`${booking.id}-${booking.type}`}
                    className={`p-4 rounded-lg border ${
                      statusColors[booking.status as keyof typeof statusColors] || statusColors.Confirmed
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-white/10">
                            {booking.type === 'pickup' ? '📦 Pickup' : '📥 Return'}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 rounded bg-white/10">
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-semibold text-white">
                          Booking #{booking.id.slice(0, 8)}
                        </p>
                        {booking.package && (
                          <p className="text-sm text-gray-300 mt-1">
                            Package: {booking.package.name}
                          </p>
                        )}
                        {booking.bookingItems.length > 0 && (
                          <p className="text-sm text-gray-300 mt-1">
                            {booking.bookingItems.length} item(s)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(booking.totalPrice)}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {booking.type === 'pickup'
                            ? new Date(booking.pickupDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : new Date(booking.returnDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            ))}
          
          {bookings.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No confirmed bookings in the calendar</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

