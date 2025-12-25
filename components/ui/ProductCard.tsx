import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  category: string
  specs: Record<string, any>
  dayRate: number
  imageUrl?: string
  status: string
  badges?: Array<'popular' | 'easy-setup' | 'new'>
  onQuickAdd?: (id: string) => void
}

export function ProductCard({
  id,
  name,
  category,
  specs,
  dayRate,
  imageUrl,
  status,
  badges = [],
  onQuickAdd,
}: ProductCardProps) {
  const isAvailable = status === 'Active'
  
  return (
    <Card hover className="h-full flex flex-col">
      <div className="relative h-32 bg-deep-slate rounded-t-lg overflow-hidden mb-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {badges.map((badge) => (
            <Badge key={badge} variant={badge}>
              {badge === 'popular' ? 'Popular' : badge === 'easy-setup' ? 'Easy Setup' : 'New'}
            </Badge>
          ))}
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-sm text-gray-400">{category}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="space-y-1.5 mb-3 text-sm">
          {specs.watts && (
            <div className="flex justify-between">
              <span className="text-gray-400">Power:</span>
              <span className="text-white">{specs.watts}W</span>
            </div>
          )}
          {specs.audienceCapacity && (
            <div className="flex justify-between">
              <span className="text-gray-400">Capacity:</span>
              <span className="text-white">{specs.audienceCapacity} people</span>
            </div>
          )}
          {specs.connectionTypes && (
            <div className="flex justify-between">
              <span className="text-gray-400">Connections:</span>
              <span className="text-white">{specs.connectionTypes.join(', ')}</span>
            </div>
          )}
          {specs.channels && (
            <div className="flex justify-between">
              <span className="text-gray-400">Channels:</span>
              <span className="text-white">{specs.channels}</span>
            </div>
          )}
          {specs.type && (
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{specs.type}</span>
            </div>
          )}
          {specs.length && (
            <div className="flex justify-between">
              <span className="text-gray-400">Length:</span>
              <span className="text-white">{specs.length}ft</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700 mb-3">
          <span className="text-gray-400 text-xs">Daily Rate:</span>
          <span className="text-neon-blue font-bold text-lg">{formatCurrency(dayRate)}</span>
        </div>
        {onQuickAdd && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => onQuickAdd(id)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Quick Add to Rental' : 'Unavailable'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

