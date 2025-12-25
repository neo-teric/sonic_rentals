import { db } from '@/lib/db'
import { PackageCard } from '@/components/ui/PackageCard'

export const dynamic = 'force-dynamic'

async function getPackages() {
  const packages = await db.package.findMany({
    orderBy: { basePrice: 'asc' },
  })
  return packages
}

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <main className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Rental Packages</h1>
          <p className="text-xl text-gray-400">
            Choose the perfect package for your event size and type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            return (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                idealFor={pkg.idealFor}
                crowdSize={pkg.crowdSize}
                setupTime={pkg.setupTime}
                basePrice={pkg.basePrice}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

