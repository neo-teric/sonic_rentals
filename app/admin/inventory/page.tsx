import { db } from '@/lib/db'
import { EquipmentManager } from '@/components/admin/EquipmentManager'

export const dynamic = 'force-dynamic'

async function getEquipment() {
  const equipment = await db.equipment.findMany({
    orderBy: { name: 'asc' },
  })
  return equipment
}

export default async function InventoryPage() {
  const equipment = await getEquipment()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Inventory Management</h1>
        <p className="text-gray-400">Manage your equipment inventory</p>
      </div>

      <EquipmentManager initialEquipment={equipment} />
    </div>
  )
}

