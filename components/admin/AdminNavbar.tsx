'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function AdminNavbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/quick-actions', label: 'Quick Actions' },
    { href: '/admin/inventory', label: 'Inventory' },
    { href: '/admin/rentals', label: 'Rentals' },
    { href: '/admin/past-bookings', label: 'Past Bookings' },
    { href: '/admin/calendar', label: 'Calendar' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-700 bg-deep-slate/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap min-w-0 flex-1">
            <Link href="/admin/dashboard" className="text-xl font-bold bg-gradient-to-r from-neon-blue to-cyber-green bg-clip-text text-transparent whitespace-nowrap flex-shrink-0">
              Admin Portal
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap flex-shrink-0 ${
                    pathname === item.href
                      ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/30'
                      : 'text-gray-300 hover:text-neon-blue hover:bg-neon-blue/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/" className="text-sm text-gray-400 hover:text-neon-blue whitespace-nowrap">
              View Site
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

