import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        package: true,
        bookingItems: {
          include: {
            equipment: true,
            addOn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      packageId,
      pickupDate,
      returnDate,
      totalPrice,
      deposit,
      deliveryOption,
      customerName,
      customerEmail,
      customerPhone,
      equipmentIds = [],
      addOnIds = [],
    } = body

    // Create or get user
    let user = await db.user.findUnique({
      where: { email: customerEmail },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          role: 'customer',
        },
      })
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        packageId: packageId || null,
        pickupDate: new Date(pickupDate),
        returnDate: new Date(returnDate),
        totalPrice,
        deposit,
        status: 'Pending',
        deliveryOption: deliveryOption || 'WarehousePickup',
      },
    })

    // Create booking items for equipment
    for (const equipmentId of equipmentIds) {
      const equipment = await db.equipment.findUnique({
        where: { id: equipmentId },
      })
      if (equipment) {
        await db.bookingItem.create({
          data: {
            bookingId: booking.id,
            equipmentId,
            quantity: 1,
          },
        })
      }
    }

    // Create booking items for add-ons
    for (const addOnId of addOnIds) {
      const addOn = await db.addOn.findUnique({
        where: { id: addOnId },
      })
      if (addOn) {
        await db.bookingItem.create({
          data: {
            bookingId: booking.id,
            addOnId,
            quantity: 1,
          },
        })
      }
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

