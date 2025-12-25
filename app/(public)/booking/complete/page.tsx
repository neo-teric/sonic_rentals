import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function BookingCompletePage() {
  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Booking Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-cyber-green/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-300">
              Your booking request has been submitted successfully. We'll review it and confirm shortly.
            </p>
            <p className="text-sm text-gray-400">
              You'll receive a confirmation email once your booking is approved.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/">
                <Button variant="primary">Back to Home</Button>
              </Link>
              <Link href="/packages">
                <Button variant="outline">Browse More Packages</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

