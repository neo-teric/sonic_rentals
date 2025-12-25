import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ConfirmBookingButton } from '@/components/admin/ConfirmBookingButton'
import { RejectBookingButton } from '@/components/admin/RejectBookingButton'
import { DeleteBookingButton } from '@/components/admin/DeleteBookingButton'

export const dynamic = 'force-dynamic'

async function getBookings() {
  const bookings = await db.booking.findMany({
    include: {
      package: true,
      bookingItems: {
        include: {
          equipment: true,
          addOn: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return bookings
}

export default async function RentalsPage() {
  const bookings = await getBookings()

  const statusColors = {
    Pending: 'bg-yellow-500/20 text-yellow-500',
    Confirmed: 'bg-blue-500/20 text-blue-500',
    Active: 'bg-cyber-green/20 text-cyber-green',
    Completed: 'bg-gray-500/20 text-gray-400',
    Cancelled: 'bg-red-500/20 text-red-500',
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Rental Management</h1>
        <p className="text-gray-400">View and manage all bookings</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">Booking #{booking.id.slice(0, 8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors] || statusColors.Pending}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-gray-400">
                    {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neon-blue">{formatCurrency(booking.totalPrice)}</p>
                  <p className="text-sm text-gray-400">Deposit: {formatCurrency(booking.deposit)}</p>
                </div>
              </div>

              {booking.package && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Package:</p>
                  <p className="text-white font-medium">{booking.package.name}</p>
                </div>
              )}

              {booking.bookingItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Items:</p>
                  <div className="space-y-1">
                    {booking.bookingItems.map((item) => (
                      <div key={item.id} className="text-sm text-gray-300">
                        {item.equipment?.name || item.addOn?.name} x{item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/rentals/${booking.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <ConfirmBookingButton bookingId={booking.id} currentStatus={booking.status} />
                <RejectBookingButton bookingId={booking.id} currentStatus={booking.status} />
                <DeleteBookingButton bookingId={booking.id} currentStatus={booking.status} />
                {booking.status === 'Completed' && !booking.inspectionCompleted && (
                  <Link href={`/admin/rentals/${booking.id}?inspect=true`}>
                    <Button variant="primary" size="sm">Complete Inspection</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

