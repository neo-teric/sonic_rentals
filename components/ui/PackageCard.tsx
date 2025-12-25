import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card'
import { Button } from './Button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface PackageCardProps {
  id: string
  name: string
  idealFor: string
  crowdSize: string
  setupTime: number
  basePrice: number
}

export function PackageCard({
  id,
  name,
  idealFor,
  crowdSize,
  setupTime,
  basePrice,
}: PackageCardProps) {
  return (
    <Link href={`/packages/${id}`}>
      <Card className="hover:border-neon-blue transition-all duration-300 cursor-pointer h-full group hover:shadow-lg hover:shadow-neon-blue/20 hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <CardTitle className="text-xl text-white group-hover:text-neon-blue transition-colors">
              {name}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            {idealFor}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-gray-400">Crowd:</span>
              <span className="text-white font-medium">{crowdSize}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-400">Setup:</span>
              <span className="text-white font-medium">{setupTime} mins</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-400 text-sm">Starting at</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-blue">{formatCurrency(basePrice)}</div>
                <div className="text-xs text-gray-500">per day</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="primary" className="w-full group-hover:bg-cyber-green transition-colors">
              View Details →
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

