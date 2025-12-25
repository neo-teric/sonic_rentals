import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const [bookings, equipment, packages, activeRentals] = await Promise.all([
    db.booking.count(),
    db.equipment.count({ where: { status: 'Active' } }),
    db.package.count(),
    db.booking.count({ where: { status: 'Active' } }),
  ])

  const totalRevenue = await db.booking.aggregate({
    where: {
      status: { in: ['Confirmed', 'Active', 'Completed'] },
    },
    _sum: {
      totalPrice: true,
    },
  })

  const pendingBookings = await db.booking.count({
    where: { status: 'Pending' },
  })

  return {
    bookings,
    equipment,
    packages,
    activeRentals,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    pendingBookings,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your rental business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neon-blue">{stats.bookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Active Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyber-green">{stats.equipment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-neon-blue">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyber-green">{stats.activeRentals}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/inventory">
                <Button variant="primary" className="w-full justify-start">
                  Manage Inventory
                </Button>
              </Link>
              <Link href="/admin/rentals">
                <Button variant="outline" className="w-full justify-start">
                  View All Rentals
                </Button>
              </Link>
              <Link href="/admin/calendar">
                <Button variant="outline" className="w-full justify-start">
                  View Calendar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-neon-blue mb-2">{stats.pendingBookings}</p>
              <p className="text-gray-400 mb-4">Bookings awaiting confirmation</p>
              <Link href="/admin/rentals?status=Pending">
                <Button variant="primary">Review Bookings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

