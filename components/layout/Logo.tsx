'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  asLink?: boolean
  className?: string
}

export function Logo({ asLink = true, className }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  // Try different possible logo file names and formats
  const logoPaths = [
    '/logo.png',
    '/logo.svg',
    '/logo.jpg',
    '/logo.jpeg',
    '/images/logo.png',
    '/images/logo.svg',
    '/images/logo.jpg',
    '/images/logo.jpeg',
  ]

  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)

  const handleImageError = () => {
    if (currentLogoIndex < logoPaths.length - 1) {
      setCurrentLogoIndex(currentLogoIndex + 1)
    } else {
      setImageError(true)
    }
  }

  const logoContent = (
    <>
      {!imageError ? (
        <Image
          src={logoPaths[currentLogoIndex]}
          alt="Sonic Rentals Logo"
          width={60}
          height={60}
          className="h-12 w-12 md:h-14 md:w-14 object-contain group-hover:scale-105 transition-all"
          priority
          onError={handleImageError}
        />
      ) : (
        <span className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-cyber-green bg-clip-text text-transparent">
          Sonic Rentals
        </span>
      )}
    </>
  )

  if (asLink) {
    return (
      <Link href="/" className={`flex items-center hover:opacity-90 transition-opacity group ${className || ''}`}>
        {logoContent}
      </Link>
    )
  }

  return (
    <div className={`flex items-center ${className || ''}`}>
      {logoContent}
    </div>
  )
}

