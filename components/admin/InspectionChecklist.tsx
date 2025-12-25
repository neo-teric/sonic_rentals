'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface InspectionChecklistProps {
  bookingId: string
}

export function InspectionChecklist({ bookingId }: InspectionChecklistProps) {
  const [formData, setFormData] = useState({
    physicalCondition: 'Excellent',
    audioTest: true,
    accessoryCount: 0,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ...formData,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error submitting inspection:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Physical Condition
        </label>
        <select
          value={formData.physicalCondition}
          onChange={(e) => setFormData({ ...formData, physicalCondition: e.target.value })}
          className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
          required
        >
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Damaged">Damaged</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.audioTest}
            onChange={(e) => setFormData({ ...formData, audioTest: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-white">Audio Test Passed</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Accessory Count
        </label>
        <input
          type="number"
          value={formData.accessoryCount}
          onChange={(e) => setFormData({ ...formData, accessoryCount: parseInt(e.target.value) })}
          className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 bg-deep-slate border border-gray-700 rounded-lg text-white"
          rows={3}
        />
      </div>

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Complete Inspection'}
      </Button>
    </form>
  )
}

