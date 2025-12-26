'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  href: string
  color: string
}

const categories: Category[] = [
  {
    id: 'speakers',
    name: 'Speakers & Subs',
    description: 'Professional PA systems',
    icon: '🔊',
    href: '/equipment?category=Speakers',
    color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  },
  {
    id: 'microphones',
    name: 'Microphones',
    description: 'Wireless & wired mics',
    icon: '🎤',
    href: '/equipment?category=Microphones',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  },
  {
    id: 'lighting',
    name: 'Lighting & FX',
    description: 'Stage lighting & effects',
    icon: '💡',
    href: '/equipment?category=Lighting',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  },
  {
    id: 'packages',
    name: 'Full Party Packages',
    description: 'Complete event solutions',
    icon: '🎉',
    href: '/packages',
    color: 'from-cyber-green/20 to-green-500/20 border-cyber-green/30',
  },
]

export function CategoryCards() {
  return (
    <section className="py-4 px-8 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((category) => (
            <Link key={category.id} href={category.href}>
              <Card className={`h-full bg-gradient-to-br ${category.color} border-2 hover:border-neon-blue/50 transition-all cursor-pointer group hover:scale-105 hover:shadow-lg hover:shadow-neon-blue/20 p-3`}>
                <div className="text-center">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="text-xs font-bold text-white mb-0.5">
                    {category.name}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

