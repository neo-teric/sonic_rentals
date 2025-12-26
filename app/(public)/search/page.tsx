'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PackageCard } from '@/components/ui/PackageCard'
import { ProductCard } from '@/components/ui/ProductCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Package {
  id: string
  name: string
  idealFor: string
  crowdSize: string
  setupTime: string
  basePrice: number
}

interface Equipment {
  id: string
  name: string
  category: string
  specs: string | Record<string, any>
  dayRate: number
  imageUrl: string | null
  status: string
}

interface SearchResults {
  packages: Package[]
  equipment: Equipment[]
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResults>({ packages: [], equipment: [] })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Search error:', err)
          setResults({ packages: [], equipment: [] })
          setIsLoading(false)
        })
    } else {
      setResults({ packages: [], equipment: [] })
    }
  }, [query])

  const handleAddToRental = (equipmentId: string) => {
    window.location.href = `/booking?equipment=${equipmentId}`
  }

  const totalResults = results.packages.length + results.equipment.length

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-charcoal py-16 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Search</h1>
          <p className="text-gray-400">Enter a search term to find packages and equipment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal py-8 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Search Results for &quot;{query}&quot;
          </h1>
          {!isLoading && (
            <p className="text-gray-400">
              Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Searching...</p>
          </div>
        ) : totalResults === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400 text-lg mb-4">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Try searching for equipment names, categories, or package types
            </p>
            <Link href="/packages">
              <Button variant="outline">Browse All Packages</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-12">
            {results.packages.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-neon-blue">Packages</span>
                  <span className="text-sm text-gray-400">({results.packages.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      id={pkg.id}
                      name={pkg.name}
                      idealFor={pkg.idealFor}
                      crowdSize={pkg.crowdSize}
                      setupTime={Number(pkg.setupTime)}
                      basePrice={pkg.basePrice}
                    />
                  ))}
                </div>
              </div>
            )}

            {results.equipment.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-cyber-green">Equipment</span>
                  <span className="text-sm text-gray-400">({results.equipment.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.equipment.map((item) => {
                    const specs = typeof item.specs === 'string' ? JSON.parse(item.specs || '{}') : item.specs
                    return (
                      <ProductCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        category={item.category}
                        specs={specs}
                        dayRate={item.dayRate}
                        imageUrl={item.imageUrl || undefined}
                        status={item.status}
                        onQuickAdd={handleAddToRental}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal py-16 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}

