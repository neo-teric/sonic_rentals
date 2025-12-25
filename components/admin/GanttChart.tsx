'use client'

import { useEffect, useState, useMemo } from 'react'
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
  bookingItems: Array<{
    id: string
    equipment?: { id: string; name: string } | null
    addOn?: { name: string } | null
    quantity: number
  }>
}

interface EquipmentTimeline {
  equipmentId: string
  equipmentName: string
  bookings: Array<{
    bookingId: string
    startDate: Date
    endDate: Date
    status: string
    quantity: number
    packageName?: string
  }>
}

export function GanttChart() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'equipment' | 'timeline'>('timeline')

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/calendar?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Build equipment timeline from bookings
  const equipmentTimeline = useMemo(() => {
    const timelineMap = new Map<string, EquipmentTimeline>()

    bookings.forEach((booking) => {
      booking.bookingItems.forEach((item) => {
        if (item.equipment) {
          const equipmentId = item.equipment.id
          const equipmentName = item.equipment.name

          if (!timelineMap.has(equipmentId)) {
            timelineMap.set(equipmentId, {
              equipmentId,
              equipmentName,
              bookings: [],
            })
          }

          const timeline = timelineMap.get(equipmentId)!
          timeline.bookings.push({
            bookingId: booking.id,
            startDate: new Date(booking.pickupDate),
            endDate: new Date(booking.returnDate),
            status: booking.status,
            quantity: item.quantity,
            packageName: booking.package?.name,
          })
        }
      })
    })

    return Array.from(timelineMap.values())
  }, [bookings])

  // Filter equipment based on selection
  const filteredTimeline = useMemo(() => {
    if (selectedEquipment.length === 0) return equipmentTimeline
    return equipmentTimeline.filter((item) => selectedEquipment.includes(item.equipmentId))
  }, [equipmentTimeline, selectedEquipment])

  // Calculate date range for display
  const days = useMemo(() => {
    const daysArray: Date[] = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      daysArray.push(new Date(d))
    }
    
    return daysArray
  }, [dateRange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-500'
      case 'Active':
        return 'bg-cyber-green'
      case 'Completed':
        return 'bg-gray-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getBookingPosition = (startDate: Date, endDate: Date) => {
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const bookingStart = new Date(startDate)
    const bookingEnd = new Date(endDate)
    
    const left = Math.max(0, Math.ceil((bookingStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const width = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    return {
      left: `${(left / totalDays) * 100}%`,
      width: `${(width / totalDays) * 100}%`,
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Loading Gantt chart...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Start Date:</label>
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
              className="px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">End Date:</label>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
              className="px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              setDateRange({
                start: today,
                end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
              })
            }}
          >
            Reset to 30 Days
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button
            variant={viewMode === 'equipment' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('equipment')}
          >
            Equipment View
          </Button>
        </div>
      </div>

      {/* Equipment Filter */}
      {viewMode === 'equipment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {equipmentTimeline.map((item) => (
                <button
                  key={item.equipmentId}
                  onClick={() => {
                    if (selectedEquipment.includes(item.equipmentId)) {
                      setSelectedEquipment(selectedEquipment.filter((id) => id !== item.equipmentId))
                    } else {
                      setSelectedEquipment([...selectedEquipment, item.equipmentId])
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedEquipment.includes(item.equipmentId)
                      ? 'bg-neon-blue text-charcoal font-semibold'
                      : 'bg-deep-slate text-white border border-gray-700 hover:border-neon-blue'
                  }`}
                >
                  {item.equipmentName}
                </button>
              ))}
              {selectedEquipment.length > 0 && (
                <button
                  onClick={() => setSelectedEquipment([])}
                  className="px-3 py-1 rounded-lg text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                >
                  Clear All
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Availability Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header with dates */}
              <div className="flex border-b border-gray-700 mb-4">
                <div className="w-48 flex-shrink-0 p-2 font-semibold text-white border-r border-gray-700">
                  Equipment
                </div>
                <div className="flex-1 relative">
                  <div className="flex">
                    {days.map((day, idx) => (
                      <div
                        key={idx}
                        className="flex-1 min-w-[60px] p-2 text-center text-xs text-gray-400 border-r border-gray-700"
                      >
                        <div>{day.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="font-semibold">{day.getDate()}</div>
                        <div className="text-[10px]">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipment rows */}
              <div className="space-y-2">
                {filteredTimeline.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {selectedEquipment.length > 0
                      ? 'No bookings found for selected equipment'
                      : 'No equipment bookings found'}
                  </div>
                ) : (
                  filteredTimeline.map((item) => (
                    <div key={item.equipmentId} className="flex border-b border-gray-700/50 pb-2">
                      <div className="w-48 flex-shrink-0 p-2 text-white border-r border-gray-700">
                        <div className="font-semibold">{item.equipmentName}</div>
                        <div className="text-xs text-gray-400">
                          {item.bookings.length} booking{item.bookings.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex-1 relative min-h-[60px]">
                        {item.bookings.map((booking) => {
                          const position = getBookingPosition(booking.startDate, booking.endDate)
                          return (
                            <div
                              key={booking.bookingId}
                              className={`absolute top-1 bottom-1 ${getStatusColor(booking.status)} rounded px-2 py-1 text-white text-xs cursor-pointer hover:opacity-80 transition-opacity`}
                              style={{
                                left: position.left,
                                width: position.width,
                                minWidth: '40px',
                              }}
                              title={`Booking ${booking.bookingId.slice(0, 8)}\nStatus: ${booking.status}\nQty: ${booking.quantity}\n${booking.packageName ? `Package: ${booking.packageName}` : ''}`}
                            >
                              <div className="truncate font-semibold">
                                {booking.packageName || `#${booking.bookingId.slice(0, 6)}`}
                              </div>
                              <div className="text-[10px] opacity-90">Qty: {booking.quantity}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-400">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-white">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-cyber-green rounded"></div>
                <span className="text-white">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-white">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-white">Pending</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

