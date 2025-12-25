import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Try to get reason from query params or request body
    const { searchParams } = new URL(request.url)
    let reason: string | null = searchParams.get('reason')
    
    // If not in query params, try to read from body (for compatibility)
    if (!reason) {
      try {
        const body = await request.json()
        reason = body.reason || null
      } catch {
        // Body parsing failed, reason stays null
        reason = null
      }
    }

    // Get the booking with all related data
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        package: true,
        bookingItems: {
          include: {
            equipment: true,
            addOn: true,
          },
        },
        inspectionChecklist: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Use a transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // Create past booking record
      const pastBooking = await tx.pastBooking.create({
        data: {
          originalBookingId: booking.id,
          userId: booking.userId,
          packageId: booking.packageId,
          packageName: booking.package?.name || null,
          pickupDate: booking.pickupDate,
          returnDate: booking.returnDate,
          totalPrice: booking.totalPrice,
          deposit: booking.deposit,
          originalStatus: booking.status,
          action: 'deleted',
          actionBy: (session.user as any)?.id || null,
          actionReason: reason || null,
          deliveryOption: booking.deliveryOption,
          signature: booking.signature,
          idUploadUrl: booking.idUploadUrl,
          stripePaymentIntentId: booking.stripePaymentIntentId,
          stripeDepositIntentId: booking.stripeDepositIntentId,
          inspectionCompleted: booking.inspectionCompleted,
          depositRefunded: booking.depositRefunded,
          lateFee: booking.lateFee,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          pastBookingItems: {
            create: booking.bookingItems.length > 0 
              ? booking.bookingItems.map((item: { equipmentId: string | null; equipment: { name: string } | null; addOnId: string | null; addOn: { name: string } | null; quantity: number }) => ({
                  equipmentId: item.equipmentId,
                  equipmentName: item.equipment?.name || null,
                  addOnId: item.addOnId,
                  addOnName: item.addOn?.name || null,
                  quantity: item.quantity,
                }))
              : [],
          },
        },
      })

      // Delete the original booking (cascade will handle related records)
      await tx.booking.delete({
        where: { id },
      })

      return pastBooking
    })

    return NextResponse.json({ success: true, pastBookingId: result.id })
  } catch (error: any) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete booking',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

