import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { EquipmentList } from '@/components/equipment/EquipmentList'

export const dynamic = 'force-dynamic'

async function getEquipment() {
  const equipment = await db.equipment.findMany({
    where: {
      status: 'Active',
    },
    orderBy: { category: 'asc' },
  })
  
  // Parse specs JSON strings
  return equipment.map((item: typeof equipment[0]) => ({
    ...item,
    specs: typeof item.specs === 'string' ? JSON.parse(item.specs || '{}') : item.specs,
  }))
}

export default async function EquipmentPage() {
  const equipment = await getEquipment()

  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Equipment Inventory</h1>
          <p className="text-xl text-gray-400">
            Browse our full selection of professional audio equipment
          </p>
        </div>

        {equipment.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Equipment Available</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <EquipmentList equipment={equipment} />
        )}
      </div>
    </main>
  )
}

