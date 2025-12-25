import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get('equipmentId')

    const where = equipmentId ? { equipmentId } : {}

    const logs = await db.maintenanceLog.findMany({
      where,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching maintenance logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance logs' },
      { status: 500 }
    )
  }
}

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
    const { equipmentId, status, notes, repairedBy } = body

    // Create maintenance log entry
    const log = await db.maintenanceLog.create({
      data: {
        equipmentId,
        status,
        notes,
        repairedBy: repairedBy || session.user?.id || null,
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    })

    // Update equipment status if provided
    if (status) {
      await db.equipment.update({
        where: { id: equipmentId },
        data: { status },
      })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error creating maintenance log:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance log' },
      { status: 500 }
    )
  }
}

