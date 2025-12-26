'use client'

import { PackageCard } from '@/components/ui/PackageCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Package {
  id: string
  name: string
  idealFor: string
  crowdSize: string
  setupTime: number
  basePrice: number
}

interface PopularPackagesProps {
  packages: Package[]
}

export function PopularPackages({ packages }: PopularPackagesProps) {
  // Show top 3 packages or all if less than 3
  const popularPackages = packages.slice(0, 3)

  if (popularPackages.length === 0) {
    return null
  }

  return (
    <section className="py-4 px-8 bg-deep-slate">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
            Popular Packages
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto">
            Pre-configured solutions for different event sizes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {popularPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              idealFor={pkg.idealFor}
              crowdSize={pkg.crowdSize}
              setupTime={pkg.setupTime}
              basePrice={pkg.basePrice}
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/packages">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs px-4 py-1.5 border-2 border-neon-blue/50 text-white hover:bg-neon-blue/10"
            >
              View All →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

