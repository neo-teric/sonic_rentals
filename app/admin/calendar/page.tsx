import { CalendarView } from '@/components/admin/CalendarView'
import { GanttChart } from '@/components/admin/GanttChart'
import { Tabs } from '@/components/ui/Tabs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Master Calendar</h1>
        <p className="text-gray-400">View all confirmed and active bookings</p>
      </div>

      <Tabs
        tabs={[
          { id: 'gantt', label: 'Gantt Chart', content: <GanttChart /> },
          { id: 'list', label: 'List View', content: <CalendarView /> },
        ]}
        defaultTab="gantt"
      />
    </div>
  )
}

