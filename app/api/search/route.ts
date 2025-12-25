import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ packages: [], equipment: [] })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search packages - SQLite doesn't support case-insensitive mode, so we filter in memory
    const allPackages = await db.package.findMany({
      orderBy: { basePrice: 'asc' },
    })

    const packages = allPackages.filter((pkg) => {
      const name = (pkg.name || '').toLowerCase()
      const idealFor = (pkg.idealFor || '').toLowerCase()
      const crowdSize = (pkg.crowdSize || '').toLowerCase()
      return (
        name.includes(searchTerm) ||
        idealFor.includes(searchTerm) ||
        crowdSize.includes(searchTerm)
      )
    })

    // Search equipment - SQLite doesn't support case-insensitive mode, so we filter in memory
    const allEquipment = await db.equipment.findMany({
      where: {
        status: 'Active',
      },
      orderBy: { category: 'asc' },
    })

    const equipment = allEquipment.filter((item) => {
      const name = (item.name || '').toLowerCase()
      const category = (item.category || '').toLowerCase()
      // Try to parse specs and search within them
      let specsText = ''
      try {
        const specs = JSON.parse(item.specs || '{}')
        specsText = JSON.stringify(specs).toLowerCase()
      } catch {
        specsText = (item.specs || '').toLowerCase()
      }
      return (
        name.includes(searchTerm) ||
        category.includes(searchTerm) ||
        specsText.includes(searchTerm)
      )
    })

    // Map equipment to include all necessary fields
    const equipmentResults = equipment.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      specs: item.specs,
      dayRate: item.dayRate,
      imageUrl: item.imageUrl,
      status: item.status,
    }))

    return NextResponse.json({ packages, equipment: equipmentResults })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}

