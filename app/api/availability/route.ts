import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickupDate, returnDate, equipmentIds } = body

    if (!pickupDate || !returnDate) {
      return NextResponse.json(
        { error: 'Pickup and return dates are required' },
        { status: 400 }
      )
    }

    const pickup = new Date(pickupDate)
    const returnD = new Date(returnDate)

    // Check availability for each equipment item
    const availability: Record<string, boolean> = {}

    if (equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0) {
      for (const equipmentId of equipmentIds) {
        // Find all bookings that overlap with the requested dates
        const overlappingBookings = await db.booking.findMany({
          where: {
            status: {
              in: ['Confirmed', 'Active'],
            },
            AND: [
              {
                pickupDate: { lte: returnD },
              },
              {
                returnDate: { gte: pickup },
              },
            ],
          },
          include: {
            bookingItems: {
              where: {
                equipmentId: equipmentId,
              },
            },
          },
        })

        // Count total booked quantity
        const bookedQuantity = overlappingBookings.reduce(
          (sum, booking) =>
            sum +
            booking.bookingItems.reduce(
              (itemSum, item) => itemSum + item.quantity,
              0
            ),
          0
        )

        // Get equipment details
        const equipment = await db.equipment.findUnique({
          where: { id: equipmentId },
        })

        if (!equipment) {
          availability[equipmentId] = false
          continue
        }

        // Check if available
        availability[equipmentId] =
          equipment.quantity - bookedQuantity > 0
      }
    } else {
      // If no equipment IDs provided, return all available
      return NextResponse.json({ availability: {}, message: 'No equipment specified' })
    }

    return NextResponse.json({ availability })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

