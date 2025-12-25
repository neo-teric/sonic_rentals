'use client'

import { useState } from 'react'
import { Button } from './Button'
import { formatCurrency } from '@/lib/utils'

interface AddOn {
  id: string
  name: string
  category: string
  price: number
  description: string
}

interface AddOnMenuProps {
  addOns: AddOn[]
  selectedAddOns: string[]
  onSelectionChange: (addOnIds: string[]) => void
  className?: string
}

export function AddOnMenu({ addOns, selectedAddOns, onSelectionChange, className }: AddOnMenuProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(addOns.map(a => a.category)))]

  const filteredAddOns = categoryFilter === 'all'
    ? addOns
    : addOns.filter(a => a.category === categoryFilter)

  const toggleAddOn = (addOnId: string) => {
    if (selectedAddOns.includes(addOnId)) {
      onSelectionChange(selectedAddOns.filter(id => id !== addOnId))
    } else {
      onSelectionChange([...selectedAddOns, addOnId])
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Atmosphere':
        return 'border-purple-500/30 bg-purple-500/10'
      case 'Technical':
        return 'border-blue-500/30 bg-blue-500/10'
      case 'Premium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-gray-700 bg-deep-slate'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Atmosphere':
        return '✨'
      case 'Technical':
        return '🔧'
      case 'Premium':
        return '⭐'
      default:
        return '📦'
    }
  }

  return (
    <div className={className}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-neon-blue text-charcoal'
                : 'bg-deep-slate text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All' : `${getCategoryIcon(cat)} ${cat}`}
          </button>
        ))}
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredAddOns.map((addOn) => {
          const isSelected = selectedAddOns.includes(addOn.id)
          return (
            <div
              key={addOn.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-neon-blue bg-neon-blue/10'
                  : `${getCategoryColor(addOn.category)} border-gray-700 hover:border-gray-600`
              }`}
              onClick={() => toggleAddOn(addOn.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryIcon(addOn.category)}</span>
                    <h4 className="font-semibold text-white">{addOn.name}</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{addOn.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase">{addOn.category}</span>
                    <span className="text-lg font-bold text-neon-blue">
                      {formatCurrency(addOn.price)}
                    </span>
                  </div>
                </div>
                <div className={`ml-3 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-neon-blue bg-neon-blue'
                    : 'border-gray-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-charcoal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAddOns.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No add-ons found in this category
        </div>
      )}
    </div>
  )
}

