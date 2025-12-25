'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MaintenanceLogEntry {
  id: string
  equipmentId: string
  status: string
  notes: string
  date: string
  repairedBy: string | null
  equipment: {
    id: string
    name: string
    category: string
  }
}

interface MaintenanceLogProps {
  equipmentId?: string
  equipmentName?: string
}

export function MaintenanceLog({ equipmentId, equipmentName }: MaintenanceLogProps) {
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    status: 'InRepair',
    notes: '',
  })

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const url = equipmentId
        ? `/api/admin/maintenance?equipmentId=${equipmentId}`
        : '/api/admin/maintenance'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching maintenance logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [equipmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipmentId) return

    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId,
          status: formData.status,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        setShowAddForm(false)
        setFormData({ status: 'InRepair', notes: '' })
        fetchLogs()
        // Trigger refresh in parent component if needed
        window.dispatchEvent(new CustomEvent('maintenanceLogUpdated'))
      }
    } catch (error) {
      console.error('Error creating maintenance log:', error)
    }
  }

  const statusColors = {
    Active: 'bg-cyber-green/20 text-cyber-green border-cyber-green/30',
    InRepair: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    Retired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {equipmentName ? `Maintenance Log: ${equipmentName}` : 'Maintenance Log'}
        </h3>
        {equipmentId && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Entry'}
          </Button>
        )}
      </div>

      {showAddForm && equipmentId && (
        <Card>
          <CardHeader>
            <CardTitle>Add Maintenance Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="InRepair">In Repair</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
                  rows={4}
                  placeholder="Enter maintenance notes, repair details, or status update..."
                  required
                />
              </div>
              <Button type="submit" variant="primary">
                Add Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Loading maintenance logs...</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">No maintenance logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!equipmentName && (
                        <span className="font-semibold text-white">{log.equipment.name}</span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs border ${
                          statusColors[log.status as keyof typeof statusColors] ||
                          statusColors.InRepair
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{log.notes}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-400">
                      {new Date(log.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {log.repairedBy && (
                      <p className="text-xs text-gray-500 mt-1">By: {log.repairedBy.slice(0, 8)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

