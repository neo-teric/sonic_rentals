'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { BookingActionModal } from './BookingActionModal'

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
  // Initialize date range to show past 7 days and next 30 days to catch recent bookings
  const [dateRange, setDateRange] = useState({ 
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  })
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'equipment' | 'timeline'>('timeline')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/calendar?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        console.log('GanttChart: Fetched', data.length, 'bookings')
        if (data.length > 0) {
          console.log('GanttChart: First booking:', {
            id: data[0].id,
            status: data[0].status,
            pickupDate: data[0].pickupDate,
            returnDate: data[0].returnDate,
            bookingItemsCount: data[0].bookingItems?.length || 0,
            bookingItems: data[0].bookingItems?.map((item: any) => ({
              hasEquipment: !!item.equipment,
              equipmentId: item.equipment?.id,
              equipmentName: item.equipment?.name,
              hasAddOn: !!item.addOn,
            })) || []
          })
        }
        setBookings(data)
      } else {
        console.error('GanttChart: Failed to fetch bookings:', response.status, response.statusText)
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
    
    // Listen for booking updates
    const handleBookingUpdate = () => {
      fetchBookings()
    }
    window.addEventListener('bookingConfirmed', handleBookingUpdate)
    window.addEventListener('storage', (e) => {
      if (e.key === 'bookingUpdate') {
        fetchBookings()
      }
    })
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('bookingConfirmed', handleBookingUpdate)
    }
  }, [])

  const handleBookingClick = (bookingId: string) => {
    console.log('GanttChart: Clicked booking:', bookingId)
    if (!bookingId) {
      console.error('GanttChart: No booking ID provided')
      return
    }
    setSelectedBookingId(bookingId)
    setIsModalOpen(true)
    console.log('GanttChart: Modal should open, bookingId:', bookingId, 'isModalOpen:', true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedBookingId(null)
  }

  const handleActionComplete = () => {
    fetchBookings() // Refresh the chart
  }

  // Build equipment timeline from bookings
  const equipmentTimeline = useMemo(() => {
    const timelineMap = new Map<string, EquipmentTimeline>()

    console.log('GanttChart: Building timeline from', bookings.length, 'bookings')
    
    // First, fetch all equipment to map IDs to names
    const equipmentMap = new Map<string, string>()
    
    bookings.forEach((booking) => {
      // Process bookingItems with equipment
      if (booking.bookingItems && booking.bookingItems.length > 0) {
        booking.bookingItems.forEach((item) => {
          if (item.equipment && item.equipment.id) {
            equipmentMap.set(item.equipment.id, item.equipment.name)
          }
        })
      }
      
      // Process package equipment
      if (booking.package && booking.package.keyEquipment) {
        try {
          const packageEquipmentIds = JSON.parse(booking.package.keyEquipment || '[]')
          // We'll need to fetch equipment names later, but for now store the IDs
          packageEquipmentIds.forEach((equipmentId: string) => {
            if (equipmentId && !equipmentMap.has(equipmentId)) {
              // We'll fetch the name when we process the booking
              equipmentMap.set(equipmentId, '') // Placeholder
            }
          })
        } catch (e) {
          console.error('Error parsing package keyEquipment:', e)
        }
      }
    })
    
    // Now process bookings and add to timeline
    bookings.forEach((booking) => {
      // Parse dates in local timezone - extract date components directly from string if needed
      let startDate: Date
      let endDate: Date
      
      if (booking.pickupDate instanceof Date) {
        startDate = new Date(booking.pickupDate.getFullYear(), booking.pickupDate.getMonth(), booking.pickupDate.getDate())
      } else {
        // Parse date string directly (format: YYYY-MM-DD or ISO string)
        const pickupStr = String(booking.pickupDate)
        if (pickupStr.includes('T')) {
          // ISO string - extract date part
          const [datePart] = pickupStr.split('T')
          const [year, month, day] = datePart.split('-').map(Number)
          startDate = new Date(year, month - 1, day)
        } else {
          // Already in YYYY-MM-DD format
          const [year, month, day] = pickupStr.split('-').map(Number)
          startDate = new Date(year, month - 1, day)
        }
      }
      
      if (booking.returnDate instanceof Date) {
        endDate = new Date(booking.returnDate.getFullYear(), booking.returnDate.getMonth(), booking.returnDate.getDate())
      } else {
        // Parse date string directly
        const returnStr = String(booking.returnDate)
        if (returnStr.includes('T')) {
          // ISO string - extract date part
          const [datePart] = returnStr.split('T')
          const [year, month, day] = datePart.split('-').map(Number)
          endDate = new Date(year, month - 1, day)
        } else {
          // Already in YYYY-MM-DD format
          const [year, month, day] = returnStr.split('-').map(Number)
          endDate = new Date(year, month - 1, day)
        }
      }
      
      // Process bookingItems with equipment
      if (booking.bookingItems && booking.bookingItems.length > 0) {
        booking.bookingItems.forEach((item) => {
          if (item.equipment && item.equipment.id) {
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
              startDate,
              endDate,
              status: booking.status,
              quantity: item.quantity || 1,
              packageName: booking.package?.name,
            })
          }
        })
      }
      
      // Process package equipment (if bookingItems don't have equipment)
      if (booking.package && booking.package.keyEquipment) {
        try {
          const packageEquipmentIds = JSON.parse(booking.package.keyEquipment || '[]')
          packageEquipmentIds.forEach((equipmentId: string) => {
            if (equipmentId) {
              // Check if this equipment is already in timeline from bookingItems
              if (!timelineMap.has(equipmentId)) {
                // We need to get the equipment name - for now use ID
                // In a real scenario, we'd fetch this, but for Gantt we can work with ID
                timelineMap.set(equipmentId, {
                  equipmentId,
                  equipmentName: `Equipment ${equipmentId.slice(0, 8)}`, // Fallback name
                  bookings: [],
                })
              }
              
              const timeline = timelineMap.get(equipmentId)!
              // Only add if not already added from bookingItems
              const alreadyAdded = timeline.bookings.some(b => b.bookingId === booking.id)
              if (!alreadyAdded) {
                timeline.bookings.push({
                  bookingId: booking.id,
                  startDate,
                  endDate,
                  status: booking.status,
                  quantity: 1, // Package bookings typically book 1 of each equipment
                  packageName: booking.package?.name,
                })
              }
            }
          })
        } catch (e) {
          console.error('Error parsing package keyEquipment:', e)
        }
      }
    })

    const result = Array.from(timelineMap.values())
    console.log('GanttChart: Built timeline with', result.length, 'equipment entries')
    result.forEach(item => {
      console.log(`GanttChart: ${item.equipmentName} (${item.equipmentId}) has ${item.bookings.length} bookings`)
    })
    
    return result
  }, [bookings])

  // Filter equipment based on selection
  const filteredTimeline = useMemo(() => {
    if (selectedEquipment.length === 0) return equipmentTimeline
    return equipmentTimeline.filter((item) => selectedEquipment.includes(item.equipmentId))
  }, [equipmentTimeline, selectedEquipment])

  // Calculate date range for display
  const days = useMemo(() => {
    const daysArray: Date[] = []
    // Extract date components to avoid timezone issues
    const startYear = dateRange.start.getFullYear()
    const startMonth = dateRange.start.getMonth()
    const startDay = dateRange.start.getDate()
    
    const endYear = dateRange.end.getFullYear()
    const endMonth = dateRange.end.getMonth()
    const endDay = dateRange.end.getDate()
    
    const start = new Date(startYear, startMonth, startDay)
    const end = new Date(endYear, endMonth, endDay)
    
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
    // Extract date components to avoid timezone issues
    const rangeStartYear = dateRange.start.getFullYear()
    const rangeStartMonth = dateRange.start.getMonth()
    const rangeStartDay = dateRange.start.getDate()
    
    const rangeEndYear = dateRange.end.getFullYear()
    const rangeEndMonth = dateRange.end.getMonth()
    const rangeEndDay = dateRange.end.getDate()
    
    const bookingStartYear = startDate.getFullYear()
    const bookingStartMonth = startDate.getMonth()
    const bookingStartDay = startDate.getDate()
    
    const bookingEndYear = endDate.getFullYear()
    const bookingEndMonth = endDate.getMonth()
    const bookingEndDay = endDate.getDate()
    
    // Calculate total days in range (inclusive)
    const rangeStart = new Date(rangeStartYear, rangeStartMonth, rangeStartDay)
    const rangeEnd = new Date(rangeEndYear, rangeEndMonth, rangeEndDay)
    const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // Calculate booking position
    const bookingStart = new Date(bookingStartYear, bookingStartMonth, bookingStartDay)
    const bookingEnd = new Date(bookingEndYear, bookingEndMonth, bookingEndDay)
    
    // Days from range start
    const daysFromStart = Math.floor((bookingStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24))
    // Booking duration (inclusive)
    const bookingDuration = Math.floor((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const left = Math.max(0, daysFromStart)
    const width = Math.max(1, bookingDuration)
    
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
              value={(() => {
                const d = new Date(dateRange.start)
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
              })()}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-').map(Number)
                setDateRange({ ...dateRange, start: new Date(year, month - 1, day, 12, 0, 0) })
              }}
              className="px-3 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">End Date:</label>
            <input
              type="date"
              value={(() => {
                const d = new Date(dateRange.end)
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
              })()}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-').map(Number)
                setDateRange({ ...dateRange, end: new Date(year, month - 1, day, 12, 0, 0) })
              }}
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
                      : bookings.length === 0
                      ? 'No bookings found. Make sure bookings have equipment items.'
                      : 'No equipment bookings found. Bookings may not have equipment items, or they may be outside the selected date range.'}
                    {bookings.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div>Total bookings: {bookings.length}</div>
                        <div>Bookings with items: {bookings.filter(b => b.bookingItems && b.bookingItems.length > 0).length}</div>
                        <div>Items with equipment: {bookings.reduce((sum, b) => sum + (b.bookingItems?.filter((item: any) => item.equipment).length || 0), 0)}</div>
                      </div>
                    )}
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
                      <div className="flex-1 relative min-h-[60px]" style={{ pointerEvents: 'none' }}>
                        {item.bookings
                          .filter((booking) => {
                            // Filter bookings that overlap with the visible date range
                            const bookingStart = new Date(booking.startDate)
                            const bookingEnd = new Date(booking.endDate)
                            const rangeStart = new Date(dateRange.start)
                            const rangeEnd = new Date(dateRange.end)
                            
                            // Check if booking overlaps with visible range
                            return bookingStart <= rangeEnd && bookingEnd >= rangeStart
                          })
                          .map((booking) => {
                            const position = getBookingPosition(booking.startDate, booking.endDate)
                            return (
                              <div
                                key={booking.bookingId}
                                className={`absolute top-1 bottom-1 ${getStatusColor(booking.status)} rounded px-2 py-1 text-white text-xs cursor-pointer hover:opacity-90 hover:scale-[1.02] hover:shadow-lg transition-all z-20 select-none`}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  minWidth: '40px',
                                  maxWidth: '100%',
                                  pointerEvents: 'auto',
                                }}
                                title={`Booking ${booking.bookingId.slice(0, 8)}\nStatus: ${booking.status}\nQty: ${booking.quantity}\n${booking.packageName ? `Package: ${booking.packageName}` : ''}\nDates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}\nClick to view details`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  console.log('Booking div clicked:', booking.bookingId)
                                  handleBookingClick(booking.bookingId)
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                }}
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

      {/* Booking Action Modal */}
      <BookingActionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        bookingId={selectedBookingId}
        onActionComplete={handleActionComplete}
      />
    </div>
  )
}

