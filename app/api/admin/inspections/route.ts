import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, physicalCondition, audioTest, accessoryCount, notes } = body

    // Create or update inspection checklist
    await db.inspectionChecklist.upsert({
      where: { bookingId },
      update: {
        physicalCondition,
        audioTest,
        accessoryCount,
        notes: notes || null,
        completedBy: session.user.id,
        completedAt: new Date(),
      },
      create: {
        bookingId,
        physicalCondition,
        audioTest,
        accessoryCount,
        notes: notes || null,
        completedBy: session.user.id,
        completedAt: new Date(),
      },
    })

    // Update booking to mark inspection as completed
    await db.booking.update({
      where: { id: bookingId },
      data: { inspectionCompleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting inspection:', error)
    return NextResponse.json(
      { error: 'Failed to submit inspection' },
      { status: 500 }
    )
  }
}

