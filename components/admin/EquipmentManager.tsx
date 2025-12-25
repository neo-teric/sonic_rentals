'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { ProductCard } from '@/components/ui/ProductCard'

interface Equipment {
  id: string
  name: string
  category: string
  specs: string
  dayRate: number
  serialNumber: string | null
  status: string
  imageUrl: string | null
  quantity: number
}

interface EquipmentManagerProps {
  initialEquipment: Equipment[]
}

export function EquipmentManager({ initialEquipment }: EquipmentManagerProps) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  // Set default date to today
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [availability, setAvailability] = useState<Record<string, { total: number; booked: number; available: number }>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    specs: '{}',
    dayRate: 0,
    serialNumber: '',
    status: 'Active',
    quantity: 1,
  })

  // Fetch availability when date is selected
  useEffect(() => {
    if (selectedDate) {
      setLoadingAvailability(true)
      fetch(`/api/admin/inventory/availability?date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setAvailability(data)
          setLoadingAvailability(false)
        })
        .catch(err => {
          console.error('Error fetching availability:', err)
          setLoadingAvailability(false)
        })
    } else {
      setAvailability({})
    }
  }, [selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editing 
      ? `/api/admin/inventory/${editing.id}`
      : '/api/admin/inventory'
    
    const method = editing ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          specs: JSON.parse(formData.specs),
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        if (editing) {
          setEquipment(equipment.map(e => e.id === editing.id ? updated : e))
        } else {
          setEquipment([...equipment, updated])
        }
        setShowAddForm(false)
        setEditing(null)
        setFormData({
          name: '',
          category: '',
          specs: '{}',
          dayRate: 0,
          serialNumber: '',
          status: 'Active',
          quantity: 1,
        })
      }
    } catch (error) {
      console.error('Error saving equipment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      const response = await fetch(`/api/admin/inventory/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEquipment(equipment.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Error deleting equipment:', error)
    }
  }

  const startEdit = (item: Equipment) => {
    setEditing(item)
    setFormData({
      name: item.name,
      category: item.category,
      specs: item.specs,
      dayRate: item.dayRate,
      serialNumber: item.serialNumber || '',
      status: item.status,
      quantity: item.quantity,
    })
    setShowAddForm(true)
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Equipment List</h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white">Check Availability:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate('')}
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditing(null)
              setFormData({
                name: '',
                category: '',
                specs: '{}',
                dayRate: 0,
                serialNumber: '',
                status: 'Active',
                quantity: 1,
              })
            }}
          >
            {showAddForm ? 'Cancel' : 'Add Equipment'}
          </Button>
        </div>
      </div>

      {selectedDate && (
        <Card className="mb-6 border-neon-blue/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Showing availability for:</span>
              <span className="text-white font-semibold">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {loadingAvailability && (
                <span className="text-xs text-gray-500">(Loading...)</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? 'Edit Equipment' : 'Add New Equipment'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Day Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dayRate}
                    onChange={(e) => setFormData({ ...formData, dayRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="InRepair">In Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Serial Number (optional)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Specs (JSON)</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white font-mono text-sm"
                  rows={4}
                  placeholder='{"watts": 1000, "audienceCapacity": 50, "connectionTypes": ["XLR"]}'
                />
              </div>
              <Button type="submit" variant="primary">
                {editing ? 'Update Equipment' : 'Add Equipment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => {
          const specs = JSON.parse(item.specs || '{}')
          return (
            <Card key={item.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'Active' ? 'bg-cyber-green/20 text-cyber-green' :
                    item.status === 'InRepair' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate:</span>
                    <span className="text-neon-blue font-bold">{formatCurrency(item.dayRate)}</span>
                  </div>
                  {selectedDate && availability[item.id] ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Quantity:</span>
                        <span className="text-white">{availability[item.id].total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Booked:</span>
                        <span className="text-yellow-400">{availability[item.id].booked}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-1 mt-1">
                        <span className="text-gray-400 font-semibold">Available:</span>
                        <span className={`font-bold ${
                          availability[item.id].available > 0 
                            ? 'text-cyber-green' 
                            : 'text-red-400'
                        }`}>
                          {availability[item.id].available}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">{item.quantity}</span>
                    </div>
                  )}
                  {item.serialNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial:</span>
                      <span className="text-white text-xs">{item.serialNumber}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

