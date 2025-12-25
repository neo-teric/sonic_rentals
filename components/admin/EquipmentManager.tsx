'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import { MaintenanceLog } from './MaintenanceLog'
import { Tabs } from '@/components/ui/Tabs'

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
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedEquipmentForMaintenance, setSelectedEquipmentForMaintenance] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(equipment.map(e => e.category))).sort()
  }, [equipment])

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = !statusFilter || item.status === statusFilter
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [equipment, searchQuery, statusFilter, categoryFilter])

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

  // Listen for maintenance log updates
  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      // Refresh equipment list to get updated statuses
      fetch('/api/admin/inventory')
        .then(res => res.json())
        .then(data => setEquipment(data))
        .catch(err => console.error('Error refreshing equipment:', err))
    }
    
    window.addEventListener('maintenanceLogUpdated', handleMaintenanceUpdate)
    return () => window.removeEventListener('maintenanceLogUpdated', handleMaintenanceUpdate)
  }, [])

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

  const handleBulkDelete = async () => {
    if (selectedEquipment.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedEquipment.length} equipment item(s)?`)) return

    try {
      const promises = selectedEquipment.map(id =>
        fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' })
      )
      await Promise.all(promises)
      setEquipment(equipment.filter(e => !selectedEquipment.includes(e.id)))
      setSelectedEquipment([])
    } catch (error) {
      console.error('Error deleting equipment:', error)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedEquipment.length === 0) return

    try {
      const promises = selectedEquipment.map(id =>
        fetch(`/api/admin/inventory/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      )
      await Promise.all(promises)
      setEquipment(equipment.map(e => 
        selectedEquipment.includes(e.id) ? { ...e, status: newStatus } : e
      ))
      setSelectedEquipment([])
    } catch (error) {
      console.error('Error updating equipment status:', error)
    }
  }

  const startEdit = (item: Equipment) => {
    setEditing(item)
    setShowAddForm(false) // Close add form if open
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

  const toggleEquipmentSelection = (id: string) => {
    if (selectedEquipment.includes(id)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== id))
    } else {
      setSelectedEquipment([...selectedEquipment, id])
    }
  }

  const selectAll = () => {
    if (selectedEquipment.length === filteredEquipment.length) {
      setSelectedEquipment([])
    } else {
      setSelectedEquipment(filteredEquipment.map(e => e.id))
    }
  }

  return (
    <div>
      {/* Header with controls */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-white">Equipment List ({filteredEquipment.length})</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
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
              {showAddForm ? 'Cancel' : '+ Add Equipment'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, category, serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="InRepair">In Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Check Availability</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  />
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate('')}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedEquipment.length > 0 && (
          <Card className="border-neon-blue/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">
                  {selectedEquipment.length} item(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('Active')}
                  >
                    Mark Active
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('InRepair')}
                  >
                    Mark In Repair
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('Retired')}
                  >
                    Mark Retired
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEquipment([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedDate && (
        <Card className="mb-6 border-neon-blue/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Showing availability for:</span>
              <span className="text-xs text-gray-500">(raw: {selectedDate})</span>
              <span className="text-white font-semibold">
                {(() => {
                  // Parse date string directly (format: YYYY-MM-DD)
                  // Ensure we have a valid date string
                  if (!selectedDate || !selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return selectedDate
                  }
                  
                  const parts = selectedDate.split('-')
                  const year = parseInt(parts[0], 10)
                  const month = parseInt(parts[1], 10)
                  const day = parseInt(parts[2], 10)
                  
                  // Validate parsed values
                  if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    return selectedDate
                  }
                  
                  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                  
                  // Calculate weekday using Zeller's congruence to avoid timezone issues
                  let y = year
                  let m = month
                  if (m < 3) {
                    m += 12
                    y -= 1
                  }
                  const k = y % 100
                  const j = Math.floor(y / 100)
                  const weekday = (day + Math.floor(13 * (m + 1) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7
                  // Adjust for modulo result (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
                  const weekdayIndex = weekday === 0 ? 6 : weekday - 1
                  
                  return `${weekdays[weekdayIndex]}, ${months[month - 1]} ${day}, ${year}`
                })()}
              </span>
              {loadingAvailability && (
                <span className="text-xs text-gray-500">(Loading...)</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Form (inline) */}
      {showAddForm && !editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Equipment</CardTitle>
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
                Add Equipment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editing}
        onClose={() => {
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
        title="Edit Equipment"
        size="lg"
      >
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
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
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
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Equipment List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => {
            const specs = JSON.parse(item.specs || '{}')
            const isSelected = selectedEquipment.includes(item.id)
            return (
              <div
                key={item.id}
                onClick={() => toggleEquipmentSelection(item.id)}
                className="cursor-pointer"
              >
              <Card 
                className={`relative transition-all ${
                  isSelected ? 'ring-2 ring-neon-blue border-neon-blue' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEquipmentSelection(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-700 bg-deep-slate text-neon-blue focus:ring-neon-blue"
                        />
                        <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      </div>
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
                      onClick={(e) => {
                        e.stopPropagation()
                        startEdit(item)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEquipmentForMaintenance(item.id)
                      }}
                    >
                      Maintenance
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.length === filteredEquipment.length && filteredEquipment.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-gray-700 bg-deep-slate text-neon-blue"
                      />
                    </th>
                    <th className="p-4 text-left text-white font-semibold">Name</th>
                    <th className="p-4 text-left text-white font-semibold">Category</th>
                    <th className="p-4 text-left text-white font-semibold">Status</th>
                    <th className="p-4 text-left text-white font-semibold">Rate</th>
                    <th className="p-4 text-left text-white font-semibold">Quantity</th>
                    <th className="p-4 text-left text-white font-semibold">Serial</th>
                    <th className="p-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item) => {
                    const isSelected = selectedEquipment.includes(item.id)
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-700/50 hover:bg-deep-slate/50 cursor-pointer ${
                          isSelected ? 'bg-neon-blue/10' : ''
                        }`}
                        onClick={() => toggleEquipmentSelection(item.id)}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEquipmentSelection(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-700 bg-deep-slate text-neon-blue"
                          />
                        </td>
                        <td className="p-4 text-white font-semibold">{item.name}</td>
                        <td className="p-4 text-gray-400">{item.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'Active' ? 'bg-cyber-green/20 text-cyber-green' :
                            item.status === 'InRepair' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-neon-blue font-bold">{formatCurrency(item.dayRate)}</td>
                        <td className="p-4 text-white">{item.quantity}</td>
                        <td className="p-4 text-gray-400 text-sm">{item.serialNumber || '-'}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(item)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEquipmentForMaintenance(item.id)
                              }}
                            >
                              Maintenance
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEquipment.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">No equipment found matching your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Log Modal */}
      {selectedEquipmentForMaintenance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Log</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEquipmentForMaintenance(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MaintenanceLog
                equipmentId={selectedEquipmentForMaintenance}
                equipmentName={equipment.find(e => e.id === selectedEquipmentForMaintenance)?.name}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
