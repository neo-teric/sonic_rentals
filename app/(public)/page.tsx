import { db } from '@/lib/db'
import { HomeTabs } from '@/components/home/HomeTabs'

export const dynamic = 'force-dynamic'

async function getPackages() {
  const packages = await db.package.findMany({
    orderBy: { basePrice: 'asc' },
  })
  return packages
}

export default async function HomePage() {
  const packages = await getPackages()

  return (
    <main className="min-h-screen bg-charcoal flex flex-col">
      {/* Main Content - Tabs */}
      <section className="flex-1 py-12 px-8">
        <div className="max-w-6xl mx-auto h-full">
          <div className="bg-deep-slate border border-gray-700 rounded-lg p-6 shadow-lg h-full flex flex-col">
            <HomeTabs packages={packages} />
          </div>
        </div>
      </section>
    </main>
  )
}

