import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const equipment = await db.equipment.findMany({
      where: {
        status: 'Active',
      },
      orderBy: { category: 'asc' },
    })

    // Parse specs JSON strings
    const equipmentWithParsedSpecs = equipment.map(item => ({
      ...item,
      specs: typeof item.specs === 'string' ? JSON.parse(item.specs || '{}') : item.specs,
    }))

    return NextResponse.json(equipmentWithParsedSpecs)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

