import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    
    // Get all equipment
    const allEquipment = await db.equipment.findMany({
      where: { status: 'Active' },
    })

    // Get all confirmed/active bookings that overlap with the selected date
    const overlappingBookings = await db.booking.findMany({
      where: {
        status: {
          in: ['Confirmed', 'Active'],
        },
        AND: [
          {
            pickupDate: { lte: selectedDate },
          },
          {
            returnDate: { gte: selectedDate },
          },
        ],
      },
      include: {
        bookingItems: {
          where: {
            equipmentId: { not: null },
          },
        },
        package: true, // Include package to check package equipment
      },
    })

    // Calculate availability for each equipment item
    const availability: Record<string, { total: number; booked: number; available: number }> = {}

    for (const equipment of allEquipment) {
      let bookedQuantity = 0

      // Count bookings from direct equipment bookings
      for (const booking of overlappingBookings) {
        // Check direct equipment bookings
        const equipmentBookingItems = booking.bookingItems.filter(
          item => item.equipmentId === equipment.id
        )
        bookedQuantity += equipmentBookingItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        )

        // Also check if this booking is for a package that includes this equipment
        if (booking.package && booking.package.keyEquipment) {
          try {
            const packageEquipmentIds = JSON.parse(booking.package.keyEquipment || '[]')
            if (Array.isArray(packageEquipmentIds) && packageEquipmentIds.includes(equipment.id)) {
              // Package bookings book 1 unit of each equipment in the package
              bookedQuantity += 1
            }
          } catch (e) {
            // Invalid JSON, skip
            console.error('Error parsing package keyEquipment:', e)
          }
        }
      }

      availability[equipment.id] = {
        total: equipment.quantity,
        booked: bookedQuantity,
        available: Math.max(0, equipment.quantity - bookedQuantity),
      }
    }

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error checking equipment availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

