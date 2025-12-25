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
    const searchQuery = searchParams.get('q') || ''
    const actionFilter = searchParams.get('action') || '' // 'deleted', 'rejected', or ''
    const statusFilter = searchParams.get('status') || '' // originalStatus filter
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Get all past bookings matching filters (for search, we'll filter in memory)
    const allPastBookings = await db.pastBooking.findMany({
      where: {
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(statusFilter ? { originalStatus: statusFilter } : {}),
      },
      include: {
        pastBookingItems: true,
      },
      orderBy: { archivedAt: 'desc' },
    })

    // Filter by search query if provided (case-insensitive)
    let filteredBookings = allPastBookings
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filteredBookings = allPastBookings.filter((booking) => {
        const matchesId = booking.originalBookingId.toLowerCase().includes(searchLower)
        const matchesPackage = booking.packageName?.toLowerCase().includes(searchLower) || false
        const matchesEquipment = booking.pastBookingItems.some(
          (item) =>
            item.equipmentName?.toLowerCase().includes(searchLower) ||
            item.addOnName?.toLowerCase().includes(searchLower)
        )
        return matchesId || matchesPackage || matchesEquipment
      })
    }

    // Calculate pagination
    const total = filteredBookings.length
    const paginatedBookings = filteredBookings.slice(skip, skip + limit)

    return NextResponse.json({
      pastBookings: paginatedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching past bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch past bookings' },
      { status: 500 }
    )
  }
}

