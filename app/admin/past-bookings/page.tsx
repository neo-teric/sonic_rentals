import { PastBookingsList } from '@/components/admin/PastBookingsList'

export const dynamic = 'force-dynamic'

export default async function PastBookingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Past Bookings</h1>
        <p className="text-gray-400">View archived bookings (deleted, rejected, or completed)</p>
      </div>

      <PastBookingsList />
    </div>
  )
}

