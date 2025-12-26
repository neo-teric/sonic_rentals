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

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ packages: [], equipment: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleAddToRental = (equipmentId: string) => {
    router.push(`/booking?equipment=${equipmentId}`)
    setShowResults(false)
    setSearchQuery('')
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

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults({ packages: [], equipment: [] })
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
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
    setSearchQuery(value)
    
    if (value.trim()) {
      handleSearch(value)
    } else {
      setResults({ packages: [], equipment: [] })
      setShowResults(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const totalResults = results.packages.length + results.equipment.length

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-visible z-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/95 via-charcoal/90 to-charcoal/95"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-charcoal/80"></div>
        </div>
        {/* Rim lighting effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/10 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 text-center overflow-visible">
        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
          Premium Sound for Any Event
        </h1>
        
        {/* Sub-headline */}
        <p className="text-base md:text-lg text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed">
          Professional-grade speakers, mics, and lighting for weddings, concerts, and corporate events
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
          <Link href="/booking">
            <Button 
              variant="primary" 
              size="sm" 
              className="text-sm px-5 py-2 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              Check Availability
            </Button>
          </Link>
          <Link href="/packages">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm px-5 py-2 border-2 border-white/30 text-white hover:bg-white/10"
            >
              View All Equipment
            </Button>
          </Link>
        </div>

        {/* Search Bar - Floating */}
        <div ref={searchRef} className="max-w-2xl mx-auto mt-3 relative z-30">
          <form onSubmit={handleFormSubmit}>
            <div className="bg-deep-slate/95 backdrop-blur-sm border border-neon-blue/30 rounded-lg p-0.5 shadow-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search packages, gear, or brands..."
                  className="w-full px-3 py-2 pr-10 bg-transparent border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-blue transition-colors"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
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
                </button>
              </div>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.trim() && (
            <Card className="absolute top-full mt-2 w-full z-[100] max-h-[60vh] overflow-y-auto bg-deep-slate/98 backdrop-blur-sm border-2 border-neon-blue/20 shadow-2xl">
              <div className="p-4">
                {isSearching ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Searching...</div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.packages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <span className="text-neon-blue">Packages</span>
                          <span className="text-xs text-gray-400">({results.packages.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {results.packages.slice(0, 2).map((pkg) => (
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
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <span className="text-cyber-green">Equipment</span>
                          <span className="text-xs text-gray-400">({results.equipment.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {results.equipment.slice(0, 2).map((item) => {
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

                    {totalResults > 4 && (
                      <div className="pt-3 border-t border-gray-700 text-center">
                        <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
                          <Button variant="outline" size="sm" className="text-xs">
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
      </div>
    </section>
  )
}
