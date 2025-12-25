import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-700 bg-charcoal mt-20">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-neon-blue mb-4">Sonic Rentals</h3>
            <p className="text-gray-400 text-sm">Professional audio equipment rental for events of all sizes.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/packages" className="text-gray-400 hover:text-neon-blue text-sm">Packages</Link></li>
              <li><Link href="/equipment" className="text-gray-400 hover:text-neon-blue text-sm">Equipment</Link></li>
              <li><Link href="/booking" className="text-gray-400 hover:text-neon-blue text-sm">Book Now</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/setup-guide" className="text-gray-400 hover:text-neon-blue text-sm">Setup Guide</Link></li>
              <li><Link href="/agreement" className="text-gray-400 hover:text-neon-blue text-sm">Rental Agreement</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: info@sonicrentals.com</li>
              <li>Phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Sonic Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

