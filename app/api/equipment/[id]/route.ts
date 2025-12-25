import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const equipment = await db.equipment.findUnique({
      where: { id },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    // Parse specs JSON string
    const equipmentWithParsedSpecs = {
      ...equipment,
      specs: typeof equipment.specs === 'string' ? JSON.parse(equipment.specs || '{}') : equipment.specs,
    }

    return NextResponse.json(equipmentWithParsedSpecs)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

