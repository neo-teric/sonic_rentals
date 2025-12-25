'use client'

import { Tabs } from '@/components/ui/Tabs'
import { SearchBar } from '@/components/search/SearchBar'
import { PackageCard } from '@/components/ui/PackageCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

interface Package {
  id: string
  name: string
  idealFor: string
  crowdSize: string
  setupTime: number
  basePrice: number
}

interface HomeTabsProps {
  packages: Package[]
}

export function HomeTabs({ packages }: HomeTabsProps) {
  const tabs = [
    {
      id: 'search',
      label: 'Search',
      icon: '🔍',
      content: (
        <div className="py-4">
          <p className="text-gray-400 mb-6 text-center">
            Find the perfect audio equipment or package for your event
          </p>
          <SearchBar />
        </div>
      ),
    },
    {
      id: 'packages',
      label: 'Browse Packages',
      icon: '📦',
      content: (
        <div className="py-4">
          <p className="text-gray-400 mb-6 text-center">
            Pre-configured solutions designed for different event sizes. Everything you need, nothing you don't.
          </p>
          
          {packages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No packages available at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {packages.map((pkg) => (
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
          )}

          <div className="text-center">
            <Link href="/packages">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                View All Packages →
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'booking',
      label: 'Quick Booking',
      icon: '🚀',
      content: (
        <div className="py-8 text-center">
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Ready to book? Start your rental process and get your equipment delivered to your event.
          </p>
          <Link href="/booking">
            <Button variant="primary" size="lg" className="text-lg px-12 py-4">
              Start Booking Process →
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return <Tabs tabs={tabs} defaultTab="search" className="flex flex-col h-full" />
}

