'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface BookingCalendarProps {
  onDateSelect: (pickupDate: Date | null, returnDate: Date | null) => void
  selectedPackageId?: string
  selectedEquipmentIds?: string[]
  initialPickupDate?: Date
  initialReturnDate?: Date
}

export function BookingCalendar({
  onDateSelect,
  selectedPackageId,
  selectedEquipmentIds = [],
  initialPickupDate,
  initialReturnDate,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedPickup, setSelectedPickup] = useState<Date | null>(initialPickupDate || null)
  const [selectedReturn, setSelectedReturn] = useState<Date | null>(initialReturnDate || null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [equipmentIds, setEquipmentIds] = useState<string[]>([])

  // Fetch package equipment when package changes, or use provided equipment IDs
  useEffect(() => {
    if (selectedEquipmentIds && selectedEquipmentIds.length > 0) {
      // Use directly provided equipment IDs (for standalone equipment booking)
      setEquipmentIds(selectedEquipmentIds)
    } else if (selectedPackageId) {
      // Fetch equipment from package
      fetch(`/api/packages/${selectedPackageId}`)
        .then(res => res.json())
        .then(data => {
          const ids = JSON.parse(data.keyEquipment || '[]')
          setEquipmentIds(ids)
        })
    } else {
      setEquipmentIds([])
    }
  }, [selectedPackageId, selectedEquipmentIds])

  // Check availability for current month
  useEffect(() => {
    if (equipmentIds.length === 0) return

    const checkAvailability = async () => {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      const availabilityMap: Record<string, boolean> = {}

      // Check each day in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split('T')[0]
        
        // Check if available for a single day rental
        try {
          const response = await fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pickupDate: dateStr,
              returnDate: dateStr,
              equipmentIds,
            }),
          })
          
          const data = await response.json()
          // Check if all equipment is available
          const allAvailable = equipmentIds.every(id => data.availability[id] !== false)
          availabilityMap[dateStr] = allAvailable
        } catch (error) {
          availabilityMap[dateStr] = false
        }
      }

      setAvailability(availabilityMap)
      setLoading(false)
    }

    checkAvailability()
  }, [currentMonth, equipmentIds])

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    if (!date) return

    const dateStr = date.toISOString().split('T')[0]
    if (!availability[dateStr]) return // Can't select unavailable dates

    // If no pickup selected, or clicking before pickup, set pickup
    if (!selectedPickup || date < selectedPickup) {
      setSelectedPickup(date)
      setSelectedReturn(null)
      onDateSelect(date, null)
    } 
    // If pickup selected and clicking after pickup, set return
    else if (selectedPickup && date > selectedPickup) {
      // Check if all dates in range are available
      let allAvailable = true
      for (let d = new Date(selectedPickup); d <= date; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        if (!availability[dateStr]) {
          allAvailable = false
          break
        }
      }

      if (allAvailable) {
        setSelectedReturn(date)
        onDateSelect(selectedPickup, date)
      } else {
        alert('Some dates in the selected range are not available')
      }
    }
    // If clicking the same date as pickup, clear selection
    else if (selectedPickup && date.getTime() === selectedPickup.getTime()) {
      setSelectedPickup(null)
      setSelectedReturn(null)
      onDateSelect(null, null)
    }
  }

  const isDateInRange = (date: Date) => {
    if (!selectedPickup || !selectedReturn) return false
    return date >= selectedPickup && date <= selectedReturn
  }

  const isDateSelected = (date: Date) => {
    if (!date) return false
    if (selectedPickup && date.getTime() === selectedPickup.getTime()) return true
    if (selectedReturn && date.getTime() === selectedReturn.getTime()) return true
    return false
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = getDaysInMonth()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Dates</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              ←
            </Button>
            <span className="text-white font-medium min-w-[150px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-4 text-gray-400">
            Checking availability...
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />
            }

            const dateStr = date.toISOString().split('T')[0]
            const isAvailable = availability[dateStr] !== false
            const isPast = date < today
            const isInRange = isDateInRange(date)
            const isSelected = isDateSelected(date)
            const isPickup = selectedPickup && date.getTime() === selectedPickup.getTime()
            const isReturn = selectedReturn && date.getTime() === selectedReturn.getTime()

            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(date)}
                disabled={!isAvailable || isPast}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isPast 
                    ? 'text-gray-600 cursor-not-allowed bg-deep-slate/50' 
                    : !isAvailable
                    ? 'text-gray-500 cursor-not-allowed bg-red-500/20 hover:bg-red-500/30'
                    : isSelected
                    ? 'bg-neon-blue text-charcoal font-bold'
                    : isInRange
                    ? 'bg-neon-blue/30 text-neon-blue'
                    : 'bg-deep-slate text-white hover:bg-deep-slate/80 hover:border hover:border-neon-blue/50'
                  }
                `}
                title={
                  isPast 
                    ? 'Past date' 
                    : !isAvailable 
                    ? 'Not available' 
                    : isPickup
                    ? 'Pickup date'
                    : isReturn
                    ? 'Return date'
                    : 'Available'
                }
              >
                {date.getDate()}
                {isPickup && <div className="text-[8px]">Pickup</div>}
                {isReturn && <div className="text-[8px]">Return</div>}
              </button>
            )
          })}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-deep-slate border border-gray-700"></div>
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20"></div>
              <span className="text-gray-400">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-neon-blue"></div>
              <span className="text-gray-400">Selected</span>
            </div>
          </div>

          {selectedPickup && (
            <div className="mt-4 p-3 bg-deep-slate rounded-lg">
              <p className="text-sm text-gray-400">Pickup: <span className="text-white font-medium">{selectedPickup.toLocaleDateString()}</span></p>
              {selectedReturn && (
                <p className="text-sm text-gray-400">Return: <span className="text-white font-medium">{selectedReturn.toLocaleDateString()}</span></p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

