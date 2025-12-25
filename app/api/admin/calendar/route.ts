import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all confirmed, active, and completed bookings for calendar display
    // This includes both package bookings and standalone equipment bookings
    const bookings = await db.booking.findMany({
      where: {
        status: { in: ['Confirmed', 'Active', 'Completed'] },
      },
      include: {
        package: true, // Include package info for package bookings
        bookingItems: {
          include: {
            equipment: true,
            addOn: true,
          },
        },
      },
      orderBy: { pickupDate: 'asc' },
    })

    // Log for debugging (remove in production if needed)
    console.log(`Calendar API: Found ${bookings.length} confirmed/active/completed bookings`)
    const packageBookings = bookings.filter(b => b.packageId !== null)
    console.log(`Calendar API: ${packageBookings.length} package bookings, ${bookings.length - packageBookings.length} equipment-only bookings`)

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching calendar bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar bookings' },
      { status: 500 }
    )
  }
}

