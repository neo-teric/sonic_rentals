import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <nav className="border-b border-gray-700 bg-charcoal/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          <Logo />
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link href="/packages" className="text-gray-300 hover:text-neon-blue transition-colors font-medium">
              Packages
            </Link>
            <Link href="/equipment" className="text-gray-300 hover:text-neon-blue transition-colors hidden md:block font-medium">
              Equipment
            </Link>
            <Link href="/setup-guide" className="text-gray-300 hover:text-neon-blue transition-colors hidden md:block font-medium">
              Setup Guide
            </Link>
            <Link href="/admin/login" className="text-gray-300 hover:text-neon-blue transition-colors hidden md:block font-medium">
              Admin
            </Link>
            <Link href="/booking">
              <Button variant="primary" size="sm" className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
                Check Availability
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

