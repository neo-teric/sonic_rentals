import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { InspectionChecklist } from '@/components/admin/InspectionChecklist'
import { RefundButton } from '@/components/admin/RefundButton'
import { ConfirmBookingButton } from '@/components/admin/ConfirmBookingButton'
import { RejectBookingButton } from '@/components/admin/RejectBookingButton'
import { DeleteBookingButton } from '@/components/admin/DeleteBookingButton'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getBooking(id: string) {
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      package: true,
      bookingItems: {
        include: {
          equipment: true,
          addOn: true,
        },
      },
      inspectionChecklist: true,
    },
  })
  return booking
}

export default async function RentalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ inspect?: string }>
}) {
  const { id } = await params
  const { inspect } = await searchParams
  const booking = await getBooking(id)

  if (!booking) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Rental Details</h1>
        <p className="text-gray-400">Booking #{booking.id.slice(0, 8)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-white font-medium">{booking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pickup Date</p>
                  <p className="text-white font-medium">
                    {new Date(booking.pickupDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Return Date</p>
                  <p className="text-white font-medium">
                    {new Date(booking.returnDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Delivery Option</p>
                  <p className="text-white font-medium">{booking.deliveryOption}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.package && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Package</p>
                  <p className="text-white font-medium">{booking.package.name}</p>
                </div>
              )}
              <div className="space-y-2">
                {booking.bookingItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-300">
                      {item.equipment?.name || item.addOn?.name} x{item.quantity}
                    </span>
                    <span className="text-white">
                      {formatCurrency((item.equipment?.dayRate || item.addOn?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {booking.status === 'Completed' && (
            <Card>
              <CardHeader>
                <CardTitle>Inspection</CardTitle>
              </CardHeader>
              <CardContent>
                {inspect === 'true' || !booking.inspectionChecklist ? (
                  <InspectionChecklist bookingId={booking.id} />
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Physical Condition</p>
                    <p className="text-white">{booking.inspectionChecklist.physicalCondition}</p>
                    <p className="text-sm text-gray-400">Audio Test</p>
                    <p className="text-white">{booking.inspectionChecklist.audioTest ? 'Passed' : 'Failed'}</p>
                    <p className="text-sm text-gray-400">Accessories</p>
                    <p className="text-white">{booking.inspectionChecklist.accessoryCount} verified</p>
                    {booking.inspectionChecklist.notes && (
                      <>
                        <p className="text-sm text-gray-400">Notes</p>
                        <p className="text-white">{booking.inspectionChecklist.notes}</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(booking.totalPrice - booking.deposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Deposit</span>
                  <span className="text-white">{formatCurrency(booking.deposit)}</span>
                </div>
                {booking.lateFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Late Fee</span>
                    <span className="text-red-400">{formatCurrency(booking.lateFee)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-neon-blue font-bold text-xl">
                    {formatCurrency(booking.totalPrice + booking.lateFee)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <ConfirmBookingButton bookingId={booking.id} currentStatus={booking.status} />
                <RejectBookingButton bookingId={booking.id} currentStatus={booking.status} />
                <DeleteBookingButton bookingId={booking.id} currentStatus={booking.status} />
                {booking.status === 'Completed' && 
                 booking.inspectionCompleted && 
                 !booking.depositRefunded && (
                  <RefundButton bookingId={booking.id} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

