'use client'

const steps = [
  {
    number: 1,
    title: 'Browse & Select',
    description: 'Search our inventory or choose from pre-configured packages',
    icon: '🔍',
  },
  {
    number: 2,
    title: 'Book & Schedule',
    description: 'Select your dates and complete your booking in minutes',
    icon: '📅',
  },
  {
    number: 3,
    title: 'We Deliver & Setup',
    description: 'Professional delivery and setup service available',
    icon: '🚚',
  },
]

export function HowItWorks() {
  return (
    <section className="py-4 px-8 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-1">
          How It Works
        </h2>
        <p className="text-xs text-gray-400 text-center mb-4 max-w-2xl mx-auto">
          Three simple steps
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center">
              <div className="relative mb-2">
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-neon-blue/20 to-cyber-green/20 rounded-full flex items-center justify-center border-2 border-neon-blue/30">
                  <span className="text-xl">{step.icon}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-full h-0.5 bg-gradient-to-r from-neon-blue/30 to-transparent"></div>
                )}
              </div>
              <div className="text-lg font-bold text-neon-blue mb-0.5">
                {step.number}
              </div>
              <h3 className="text-sm font-bold text-white mb-0.5">
                {step.title}
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

