import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AdminNavbar } from '@/components/admin/AdminNavbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Allow access to login page without authentication
  if (pathname === '/admin/login') {
    return <>{children}</>
  }
  
  const session = await auth()

  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <AdminNavbar />
      <main className="py-8 px-8">
        {children}
      </main>
    </div>
  )
}

