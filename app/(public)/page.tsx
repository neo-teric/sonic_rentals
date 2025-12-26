import { db } from '@/lib/db'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryCards } from '@/components/home/CategoryCards'
import { PopularPackages } from '@/components/home/PopularPackages'
import { HowItWorks } from '@/components/home/HowItWorks'
import { TrustedBy } from '@/components/home/TrustedBy'

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
    <main className="min-h-screen bg-charcoal relative">
      {/* Hero Section */}
      <div className="relative z-20">
        <HeroSection />
      </div>

      {/* Category Cards */}
      <div className="relative z-10">
        <CategoryCards />
      </div>

      {/* Popular Packages */}
      <PopularPackages packages={packages} />

      {/* How It Works */}
      <HowItWorks />

      {/* Trusted By */}
      <TrustedBy />
    </main>
  )
}

