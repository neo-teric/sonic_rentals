'use client'

import { ProductCard } from '@/components/ui/ProductCard'
import { useRouter } from 'next/navigation'

interface Equipment {
  id: string
  name: string
  category: string
  specs: Record<string, any>
  dayRate: number
  imageUrl: string | null
  status: string
}

interface EquipmentListProps {
  equipment: Equipment[]
}

export function EquipmentList({ equipment }: EquipmentListProps) {
  const router = useRouter()

  // Group equipment by category
  const equipmentByCategory = equipment.reduce((acc: Record<string, Equipment[]>, item: Equipment) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, Equipment[]>)

  // Define category order
  const categoryOrder = ['Speaker', 'Mixer', 'Microphone', 'Headphones', 'Cable']
  
  // Sort categories by the defined order
  const sortedCategories = Object.entries(equipmentByCategory).sort(([catA], [catB]) => {
    const indexA = categoryOrder.indexOf(catA)
    const indexB = categoryOrder.indexOf(catB)
    // If category not in order list, put it at the end
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const handleQuickAdd = (equipmentId: string) => {
    router.push(`/booking?equipment=${equipmentId}`)
  }

  return (
    <div className="space-y-12">
      {sortedCategories.map(([category, items]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold text-white mb-6">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const badges: Array<'popular' | 'easy-setup' | 'new'> = []
              
              // Add badges based on equipment properties
              if (item.specs.quantity && item.specs.quantity <= 2) {
                badges.push('popular')
              }
              if (item.category === 'Speaker' && item.specs.audienceCapacity && item.specs.audienceCapacity < 50) {
                badges.push('easy-setup')
              }

              return (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  specs={item.specs}
                  dayRate={item.dayRate}
                  imageUrl={item.imageUrl || undefined}
                  status={item.status}
                  badges={badges}
                  onQuickAdd={handleQuickAdd}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

