'use client'

const trustedPartners = [
  { name: 'Grontal Verges', logo: 'GV' },
  { name: 'Basist Vurfors', logo: 'BV' },
  { name: 'Line000060', logo: 'L6' },
  { name: 'Bloon House', logo: 'BH' },
]

export function TrustedBy() {
  return (
    <section className="py-3 px-8 bg-deep-slate border-t border-gray-700">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xs font-bold text-white text-center mb-3 uppercase tracking-wider">
          Trusted By
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {trustedPartners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-neon-blue/30 transition-all opacity-60 hover:opacity-100"
            >
              <span className="text-gray-400 text-[10px] font-semibold">
                {partner.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

