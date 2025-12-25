'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { AddOnMenu } from '@/components/ui/AddOnMenu'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface Equipment {
  id: string
  name: string
  category: string
  specs?: Record<string, any>
}

interface AddOn {
  id: string
  name: string
  category: string
  price: number
  description: string
}

interface UpsellModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (selectedAddOnIds: string[]) => void
  selectedEquipment: Equipment[]
  selectedPackage?: { name: string; keyEquipment: string } | null
}

export function UpsellModal({
  isOpen,
  onClose,
  onContinue,
  selectedEquipment,
  selectedPackage,
}: UpsellModalProps) {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetch('/api/addons')
        .then(res => res.json())
        .then(data => {
          setAddOns(data)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Error fetching add-ons:', err)
          setIsLoading(false)
        })
    }
  }, [isOpen])

  // Smart suggestions based on selected equipment
  const suggestedAddOns = useMemo(() => {
    if (!addOns.length) return []

    const suggestions: string[] = []
    const equipmentCategories = new Set(selectedEquipment.map(eq => eq.category.toLowerCase()))
    const equipmentNames = selectedEquipment.map(eq => eq.name.toLowerCase()).join(' ')

    // Check for speakers - suggest stands and cables
    if (equipmentNames.includes('speaker') || equipmentCategories.has('speakers')) {
      suggestions.push(...addOns.filter(a => 
        a.name.toLowerCase().includes('stand') || 
        a.name.toLowerCase().includes('cable')
      ).map(a => a.id))
    }

    // Check for microphones - suggest stands and wireless mics
    if (equipmentNames.includes('mic') || equipmentNames.includes('microphone') || 
        equipmentCategories.has('microphones')) {
      suggestions.push(...addOns.filter(a => 
        a.name.toLowerCase().includes('mic') || 
        a.name.toLowerCase().includes('stand')
      ).map(a => a.id))
    }

    // Check for mixers - suggest cables
    if (equipmentNames.includes('mixer') || equipmentCategories.has('mixers')) {
      suggestions.push(...addOns.filter(a => 
        a.name.toLowerCase().includes('cable')
      ).map(a => a.id))
    }

    // Always suggest lighting for any event
    suggestions.push(...addOns.filter(a => 
      a.category === 'Atmosphere'
    ).map(a => a.id))

    // Remove duplicates
    return Array.from(new Set(suggestions))
  }, [addOns, selectedEquipment])

  const totalAddOnPrice = useMemo(() => {
    return selectedAddOns.reduce((sum, id) => {
      const addOn = addOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)
  }, [selectedAddOns, addOns])

  const handleContinue = () => {
    onContinue(selectedAddOns)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finish Your Rig"
      size="lg"
    >
      <div className="space-y-6">
        {/* Smart Suggestions */}
        {suggestedAddOns.length > 0 && (
          <div className="p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Recommended for You</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Based on your selected equipment, we think these add-ons would enhance your setup:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedAddOns.slice(0, 3).map((addOnId) => {
                    const addOn = addOns.find(a => a.id === addOnId)
                    if (!addOn) return null
                    const isSelected = selectedAddOns.includes(addOnId)
                    return (
                      <button
                        key={addOnId}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId))
                          } else {
                            setSelectedAddOns([...selectedAddOns, addOnId])
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-cyber-green text-charcoal font-semibold'
                            : 'bg-deep-slate text-gray-300 border border-gray-700 hover:border-cyber-green'
                        }`}
                      >
                        {addOn.name} {isSelected && '✓'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Add Extras to Your Booking
          </h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading add-ons...</div>
          ) : (
            <AddOnMenu
              addOns={addOns}
              selectedAddOns={selectedAddOns}
              onSelectionChange={setSelectedAddOns}
            />
          )}
        </div>

        {/* Summary */}
        {selectedAddOns.length > 0 && (
          <div className="p-4 bg-deep-slate rounded-lg border border-gray-700">
            <h4 className="font-semibold text-white mb-2">Selected Add-ons ({selectedAddOns.length})</h4>
            <div className="space-y-1 mb-3">
              {selectedAddOns.map((id) => {
                const addOn = addOns.find(a => a.id === id)
                if (!addOn) return null
                return (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{addOn.name}</span>
                    <span className="text-neon-blue">{formatCurrency(addOn.price)}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-700 pt-2">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Add-ons Total:</span>
                <span className="text-neon-blue font-bold text-lg">
                  {formatCurrency(totalAddOnPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
          >
            Continue {selectedAddOns.length > 0 && `(${selectedAddOns.length} selected)`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

