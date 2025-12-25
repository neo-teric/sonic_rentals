import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const pkg = await db.package.findUnique({
      where: { id },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Get equipment details for the package
    const keyEquipmentIds = JSON.parse(pkg.keyEquipment || '[]')
    const equipment = await db.equipment.findMany({
      where: {
        id: {
          in: keyEquipmentIds,
        },
      },
    })

    return NextResponse.json({
      ...pkg,
      equipment,
    })
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    )
  }
}

