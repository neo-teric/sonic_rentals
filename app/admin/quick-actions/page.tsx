import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getQuickStats() {
  const pendingBookings = await db.booking.count({
    where: { status: 'Pending' },
  })

  const activeRentals = await db.booking.count({
    where: { status: 'Active' },
  })

  return {
    pendingBookings,
    activeRentals,
  }
}

export default async function QuickActionsPage() {
  const stats = await getQuickStats()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Quick Actions</h1>
        <p className="text-gray-400">Quick access to common admin tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-neon-blue transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Manage Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Add, edit, or manage equipment and packages
            </p>
            <Link href="/admin/inventory">
              <Button variant="primary" className="w-full">
                Go to Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-neon-blue transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              View All Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              View and manage all current bookings
            </p>
            <Link href="/admin/rentals">
              <Button variant="outline" className="w-full">
                View Rentals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-neon-blue transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              View Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Master calendar and Gantt chart view
            </p>
            <Link href="/admin/calendar">
              <Button variant="outline" className="w-full">
                View Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-neon-blue transition-all bg-yellow-500/10 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              Pending Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-yellow-400 mb-1">{stats.pendingBookings}</p>
              <p className="text-sm text-gray-400">Awaiting confirmation</p>
            </div>
            <Link href="/admin/rentals?status=Pending">
              <Button variant="primary" className="w-full bg-yellow-500 hover:bg-yellow-600">
                Review Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-neon-blue transition-all bg-cyber-green/10 border-cyber-green/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              Active Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold text-cyber-green mb-1">{stats.activeRentals}</p>
              <p className="text-sm text-gray-400">Currently active</p>
            </div>
            <Link href="/admin/rentals?status=Active">
              <Button variant="outline" className="w-full border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10">
                View Active
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-neon-blue transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Past Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              View completed and cancelled bookings
            </p>
            <Link href="/admin/past-bookings">
              <Button variant="outline" className="w-full">
                View Past Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

