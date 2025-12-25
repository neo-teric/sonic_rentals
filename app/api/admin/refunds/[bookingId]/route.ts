import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookingId } = await params
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.inspectionCompleted) {
      return NextResponse.json(
        { error: 'Inspection must be completed before refund' },
        { status: 400 }
      )
    }

    if (booking.depositRefunded) {
      return NextResponse.json(
        { error: 'Deposit already refunded' },
        { status: 400 }
      )
    }

    // TODO: Integrate with Stripe API to process refund
    // For now, just mark as refunded
    await db.booking.update({
      where: { id: bookingId },
      data: { depositRefunded: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

