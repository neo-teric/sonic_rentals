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
    <nav className="border-b border-gray-700 bg-deep-slate">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="text-xl font-bold bg-gradient-to-r from-neon-blue to-cyber-green bg-clip-text text-transparent">
              Admin Portal
            </Link>
            <div className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-neon-blue'
                      : 'text-gray-300 hover:text-neon-blue'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-neon-blue">
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

