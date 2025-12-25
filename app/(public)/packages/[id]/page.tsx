import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { ProductCard } from '@/components/ui/ProductCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getPackage(id: string) {
  const pkg = await db.package.findUnique({
    where: { id },
  })

  if (!pkg) {
    return null
  }

  const keyEquipmentIds = JSON.parse(pkg.keyEquipment || '[]')
  const equipment = await db.equipment.findMany({
    where: {
      id: {
        in: keyEquipmentIds,
      },
    },
  })

  return {
    ...pkg,
    equipment,
  }
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pkg = await getPackage(id)

  if (!pkg) {
    notFound()
  }

  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/packages" className="text-neon-blue hover:text-cyber-green mb-4 inline-block">
          ← Back to Packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{pkg.name}</h1>
            <p className="text-xl text-gray-300 mb-6">{pkg.idealFor}</p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Crowd Size:</span>
                      <p className="text-white font-medium">{pkg.crowdSize}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Setup Time:</span>
                      <p className="text-white font-medium">{pkg.setupTime} minutes</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Starting Price:</span>
                    <p className="text-neon-blue font-bold text-3xl">{formatCurrency(pkg.basePrice)}</p>
                    <p className="text-gray-500 text-sm">per day</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Included Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                {pkg.equipment && pkg.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.equipment.map((item) => {
                      const specs = JSON.parse(item.specs || '{}')
                      const badges: Array<'popular' | 'easy-setup' | 'new'> = []
                      
                      if (item.quantity <= 2) {
                        badges.push('popular')
                      }
                      if (item.category === 'Speaker' && specs.audienceCapacity && specs.audienceCapacity < 50) {
                        badges.push('easy-setup')
                      }

                      return (
                        <ProductCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          category={item.category}
                          specs={specs}
                          dayRate={item.dayRate}
                          imageUrl={item.imageUrl || undefined}
                          status={item.status}
                          badges={badges}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400">No equipment details available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book This Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-neon-blue mb-2">
                      {formatCurrency(pkg.basePrice)}
                    </p>
                    <p className="text-gray-400 text-sm">per day</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Price:</span>
                      <span className="text-white">{formatCurrency(pkg.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Security Deposit:</span>
                      <span className="text-white">{formatCurrency(pkg.basePrice * 0.5)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-neon-blue font-bold">
                        {formatCurrency(pkg.basePrice * 1.5)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/booking?package=${pkg.id}`}>
                    <Button variant="primary" className="w-full" size="lg">
                      Book This Package
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Security deposit is fully refundable upon return
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

