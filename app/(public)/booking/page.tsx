'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { UpsellModal } from '@/components/booking/UpsellModal'
import { ProductCard } from '@/components/ui/ProductCard'
import Link from 'next/link'

interface Equipment {
  id: string
  name: string
  category: string
  specs: Record<string, any>
  dayRate: number
  imageUrl: string | null
  status: string
}

function BookingPageContent() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const equipmentId = searchParams.get('equipment')
  const [step, setStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])
  const [availableAddOns, setAvailableAddOns] = useState<any[]>([])
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    packageId: packageId || '',
    pickupDate: '',
    returnDate: '',
    deliveryOption: 'WarehousePickup',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  // Fetch package if packageId is provided
  useEffect(() => {
    if (packageId) {
      fetch(`/api/packages/${packageId}`)
        .then(res => res.json())
        .then(data => setSelectedPackage(data))
    }
  }, [packageId])

  // Fetch equipment if equipmentId is provided
  useEffect(() => {
    if (equipmentId) {
      fetch(`/api/equipment/${equipmentId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.status === 'Active') {
            setSelectedEquipment([data])
          }
        })
        .catch(err => console.error('Error fetching equipment:', err))
    }
  }, [equipmentId])

  // Fetch available equipment for selection
  useEffect(() => {
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        const active = data.filter((eq: Equipment) => eq.status === 'Active')
        setAvailableEquipment(active)
      })
      .catch(err => console.error('Error fetching equipment:', err))
  }, [])

  // Fetch available add-ons
  useEffect(() => {
    fetch('/api/addons')
      .then(res => res.json())
      .then(data => setAvailableAddOns(data))
      .catch(err => console.error('Error fetching add-ons:', err))
  }, [])

  const addEquipment = (equipmentId: string) => {
    const equipment = availableEquipment.find(eq => eq.id === equipmentId)
    if (equipment && !selectedEquipment.find(eq => eq.id === equipmentId)) {
      setSelectedEquipment([...selectedEquipment, equipment])
    }
  }

  const removeEquipment = (equipmentId: string) => {
    setSelectedEquipment(selectedEquipment.filter(eq => eq.id !== equipmentId))
  }

  const calculateTotalPrice = () => {
    let basePrice = 0
    
    if (selectedPackage) {
      const days = bookingData.pickupDate && bookingData.returnDate
        ? Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
        : 1
      basePrice = selectedPackage.basePrice * days
    } else if (selectedEquipment.length > 0 && bookingData.pickupDate && bookingData.returnDate) {
      const days = Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
      basePrice = selectedEquipment.reduce((sum, eq) => sum + (eq.dayRate * days), 0)
    }
    
    // Add add-ons price (add-ons are one-time fees, not per-day)
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = availableAddOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)
    
    return basePrice + addOnsPrice
  }

  const steps = [
    { number: 1, title: 'Selection', description: 'Choose package or equipment' },
    { number: 2, title: 'Scheduling', description: 'Select dates' },
    { number: 3, title: 'Upsell', description: 'Add extras' },
    { number: 4, title: 'Logistics', description: 'Pickup or delivery' },
    { number: 5, title: 'Verification', description: 'Signature & ID' },
    { number: 6, title: 'Checkout', description: 'Payment' },
  ]

  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Booking</h1>
          <p className="text-gray-400">Complete your rental booking in 6 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.number ? 'bg-neon-blue text-charcoal' : 'bg-deep-slate text-gray-400'
                  }`}>
                    {s.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > s.number ? 'bg-neon-blue' : 'bg-deep-slate'
                    }`} />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs font-medium ${
                    step >= s.number ? 'text-neon-blue' : 'text-gray-400'
                  }`}>
                    {s.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
            <p className="text-sm text-gray-400">{steps[step - 1].description}</p>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                {/* Package Selection */}
                {selectedPackage ? (
                  <div className="p-4 bg-deep-slate rounded-lg border border-neon-blue/20">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedPackage.name}</h3>
                    <p className="text-gray-300 mb-4">{selectedPackage.idealFor}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Starting Price</p>
                        <p className="text-2xl font-bold text-neon-blue">
                          {formatCurrency(selectedPackage.basePrice)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setSelectedPackage(null)
                        setBookingData({ ...bookingData, packageId: '' })
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Remove Package
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Select equipment items to book:</p>
                    <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                      {availableEquipment.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Loading equipment...</p>
                      ) : (
                        availableEquipment.map((equipment) => {
                          const isSelected = selectedEquipment.some(eq => eq.id === equipment.id)
                          const specs = typeof equipment.specs === 'string' 
                            ? JSON.parse(equipment.specs || '{}') 
                            : equipment.specs
                          
                          return (
                            <div
                              key={equipment.id}
                              className={`p-3 rounded-lg border ${
                                isSelected 
                                  ? 'bg-neon-blue/10 border-neon-blue' 
                                  : 'bg-deep-slate border-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white">{equipment.name}</h4>
                                  <p className="text-sm text-gray-400">{equipment.category}</p>
                                  <p className="text-sm text-neon-blue mt-1">
                                    {formatCurrency(equipment.dayRate)}/day
                                  </p>
                                </div>
                                <Button
                                  variant={isSelected ? 'destructive' : 'primary'}
                                  size="sm"
                                  onClick={() => {
                                    if (isSelected) {
                                      removeEquipment(equipment.id)
                                    } else {
                                      addEquipment(equipment.id)
                                    }
                                  }}
                                >
                                  {isSelected ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {!selectedPackage && (
                      <Link href="/packages">
                        <Button variant="outline" className="w-full">
                          Or Browse Packages Instead
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                {/* Selected Equipment Summary */}
                {selectedEquipment.length > 0 && (
                  <div className="p-4 bg-deep-slate rounded-lg border border-cyber-green/20">
                    <h4 className="font-semibold text-white mb-3">Selected Equipment ({selectedEquipment.length})</h4>
                    <div className="space-y-2">
                      {selectedEquipment.map((eq) => (
                        <div key={eq.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{eq.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neon-blue">{formatCurrency(eq.dayRate)}/day</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEquipment(eq.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <Button 
                  onClick={() => setStep(2)} 
                  variant="primary" 
                  className="w-full"
                  disabled={!selectedPackage && selectedEquipment.length === 0}
                >
                  Continue to Scheduling
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <BookingCalendar
                  selectedPackageId={bookingData.packageId || undefined}
                  selectedEquipmentIds={selectedEquipment.map(eq => eq.id)}
                  onDateSelect={(pickup, returnD) => {
                    if (pickup) {
                      setBookingData({
                        ...bookingData,
                        pickupDate: pickup.toISOString().split('T')[0],
                        returnDate: returnD ? returnD.toISOString().split('T')[0] : '',
                      })
                    } else {
                      setBookingData({
                        ...bookingData,
                        pickupDate: '',
                        returnDate: '',
                      })
                    }
                  }}
                  initialPickupDate={bookingData.pickupDate ? new Date(bookingData.pickupDate) : undefined}
                  initialReturnDate={bookingData.returnDate ? new Date(bookingData.returnDate) : undefined}
                />
                <div className="flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    variant="primary" 
                    className="flex-1"
                    disabled={!bookingData.pickupDate || !bookingData.returnDate}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Finish Your Rig</h3>
                  <p className="text-gray-400 mb-4">
                    Add extras to make your event perfect. Browse our recommended add-ons or skip this step.
                  </p>
                </div>
                
                {selectedAddOns.length > 0 && (
                  <div className="p-4 bg-deep-slate rounded-lg border border-neon-blue/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {selectedAddOns.length} Add-on{selectedAddOns.length !== 1 ? 's' : ''} Selected
                        </p>
                        <p className="text-xs text-gray-400">
                          Total: {formatCurrency(selectedAddOns.reduce((sum, id) => {
                            const addOn = availableAddOns.find(a => a.id === id)
                            return sum + (addOn?.price || 0)
                          }, 0))}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUpsellModal(true)}
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {selectedAddOns.map((id) => {
                        const addOn = availableAddOns.find(a => a.id === id)
                        if (!addOn) return null
                        return (
                          <div key={id} className="flex justify-between text-xs text-gray-300">
                            <span>{addOn.name}</span>
                            <span className="text-neon-blue">{formatCurrency(addOn.price)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                  <Button 
                    onClick={() => setShowUpsellModal(true)} 
                    variant="primary" 
                    className="flex-1"
                  >
                    {selectedAddOns.length > 0 ? 'Browse More Add-ons' : 'Browse Add-ons'}
                  </Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    variant="ghost"
                  >
                    {selectedAddOns.length > 0 ? 'Continue' : 'Skip'}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Delivery Option</label>
                  <select
                    value={bookingData.deliveryOption}
                    onChange={(e) => setBookingData({ ...bookingData, deliveryOption: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  >
                    <option value="WarehousePickup">Warehouse Pickup</option>
                    <option value="ProfessionalDelivery">Professional Delivery</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                  <Button onClick={() => setStep(5)} variant="primary" className="flex-1">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={bookingData.customerName}
                    onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone</label>
                  <input
                    type="tel"
                    value={bookingData.customerPhone}
                    onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <p className="text-sm text-gray-400">Signature and ID upload coming in next step</p>
                <div className="flex gap-4">
                  <Button onClick={() => setStep(4)} variant="outline">Back</Button>
                  <Button 
                    onClick={() => setStep(6)} 
                    variant="primary" 
                    className="flex-1"
                    disabled={!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="p-4 bg-deep-slate rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPackage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Package:</span>
                        <span className="text-white">{selectedPackage.name}</span>
                      </div>
                    )}
                    {selectedEquipment.length > 0 && (
                      <div className="mb-2">
                        <span className="text-gray-400">Equipment:</span>
                        <div className="mt-1 space-y-1">
                          {selectedEquipment.map((eq) => {
                            const days = bookingData.pickupDate && bookingData.returnDate
                              ? Math.ceil((new Date(bookingData.returnDate).getTime() - new Date(bookingData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
                              : 1
                            return (
                              <div key={eq.id} className="flex justify-between text-xs">
                                <span className="text-gray-300">{eq.name}</span>
                                <span className="text-white">{formatCurrency(eq.dayRate * days)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {selectedAddOns.length > 0 && (
                      <div className="mb-2">
                        <span className="text-gray-400">Add-ons:</span>
                        <div className="mt-1 space-y-1">
                          {selectedAddOns.map((addOnId) => {
                            const addOn = availableAddOns.find(a => a.id === addOnId)
                            if (!addOn) return null
                            return (
                              <div key={addOnId} className="flex justify-between text-xs">
                                <span className="text-gray-300">{addOn.name}</span>
                                <span className="text-white">{formatCurrency(addOn.price)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pickup:</span>
                      <span className="text-white">{new Date(bookingData.pickupDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Return:</span>
                      <span className="text-white">{new Date(bookingData.returnDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery:</span>
                      <span className="text-white">{bookingData.deliveryOption}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Total:</span>
                        <span className="text-neon-blue font-bold text-xl">
                          {formatCurrency(calculateTotalPrice())}
                        </span>
                      </div>
                      {selectedAddOns.length > 0 && (
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-gray-400">Add-ons:</span>
                          <span className="text-gray-300">(included in total)</span>
                        </div>
                      )}
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-400 text-xs">Deposit (50%):</span>
                        <span className="text-gray-300 text-xs">
                          {formatCurrency(calculateTotalPrice() * 0.5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">Payment integration coming soon. This will create a booking in pending status.</p>
                <div className="flex gap-4">
                  <Button onClick={() => setStep(5)} variant="outline">Back</Button>
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={async () => {
                      // Create booking (without payment for now)
                      try {
                        const totalPrice = calculateTotalPrice()
                        const response = await fetch('/api/bookings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            packageId: bookingData.packageId || null,
                            equipmentIds: selectedEquipment.map(eq => eq.id),
                            addOnIds: selectedAddOns,
                            pickupDate: bookingData.pickupDate,
                            returnDate: bookingData.returnDate,
                            totalPrice,
                            deposit: totalPrice * 0.5,
                            deliveryOption: bookingData.deliveryOption,
                            customerName: bookingData.customerName,
                            customerEmail: bookingData.customerEmail,
                            customerPhone: bookingData.customerPhone,
                          }),
                        })
                        if (response.ok) {
                          window.location.href = '/booking/complete'
                        } else {
                          const error = await response.json()
                          alert(`Error: ${error.error || 'Failed to create booking'}`)
                        }
                      } catch (error) {
                        console.error('Error creating booking:', error)
                        alert('Failed to create booking. Please try again.')
                      }
                    }}
                  >
                    Complete Booking
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upsell Modal */}
        <UpsellModal
          isOpen={showUpsellModal}
          onClose={() => setShowUpsellModal(false)}
          onContinue={(addOnIds) => {
            setSelectedAddOns(addOnIds)
            setShowUpsellModal(false)
            // Optionally auto-advance to next step
            if (addOnIds.length > 0) {
              setStep(4)
            }
          }}
          selectedEquipment={selectedEquipment}
          selectedPackage={selectedPackage}
        />
      </div>
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Booking</h1>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <BookingPageContent />
    </Suspense>
  )
}

