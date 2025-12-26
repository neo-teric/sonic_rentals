'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PackageCard } from '@/components/ui/PackageCard'
import { ProductCard } from '@/components/ui/ProductCard'
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

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ packages: [], equipment: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleAddToRental = (equipmentId: string) => {
    // Navigate to booking page with equipment ID
    router.push(`/booking?equipment=${equipmentId}`)
    // Close search results
    setShowResults(false)
    setQuery('')
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ packages: [], equipment: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults({ packages: [], equipment: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim()) {
      handleSearch(value)
    } else {
      setResults({ packages: [], equipment: [] })
      setShowResults(false)
    }
  }

  const totalResults = results.packages.length + results.equipment.length

  return (
    <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search packages, gear, or brands..."
          className="w-full px-6 py-4 pr-14 bg-deep-slate border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {showResults && query.trim() && (
        <Card className="absolute top-full mt-3 w-full z-50 max-h-[70vh] overflow-y-auto bg-deep-slate border-2 border-neon-blue/20 shadow-2xl shadow-neon-blue/10">
          <div className="p-8">
            {isSearching ? (
              <div className="text-center py-12 text-gray-400">Searching...</div>
            ) : totalResults === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="space-y-8">
                {results.packages.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-neon-blue">Packages</span>
                      <span className="text-sm text-gray-400">({results.packages.length})</span>
                    </h3>
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
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-cyber-green">Equipment</span>
                      <span className="text-sm text-gray-400">({results.equipment.length})</span>
                    </h3>
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

                {totalResults > 6 && (
                  <div className="pt-6 border-t border-gray-700 text-center">
                    <Link href={`/search?q=${encodeURIComponent(query)}`}>
                      <Button variant="outline" size="sm">
                        View All {totalResults} Results →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

