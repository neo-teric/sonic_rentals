import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function AgreementPage() {
  return (
    <main className="min-h-screen py-12 px-8 bg-charcoal">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-cyber-green to-neon-blue bg-clip-text text-transparent">
            Rental Agreement
          </h1>
          <p className="text-xl text-gray-400">
            Terms and conditions for equipment rental
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6 border-gray-700">
          <CardContent className="pt-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              By renting equipment from Sonic Rentals, you agree to the following terms and conditions. 
              Please read this agreement carefully before proceeding with your rental.
            </p>
            <p className="text-gray-400 mt-4 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        {/* Damage Liability Terms */}
        <Card className="mb-6 border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant="popular" className="text-lg px-4 py-2 bg-red-500/20 text-red-400 border-red-500/50">
                ⚠️ Liability
              </Badge>
              <CardTitle className="text-2xl text-white">
                Damage Liability Terms
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-deep-slate p-5 rounded-lg border border-red-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">Renter Responsibility</h3>
              <p className="text-gray-300 mb-4">
                The renter is fully responsible for all equipment from the time of pickup/delivery until the time of return. 
                This includes but is not limited to:
              </p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Physical damage (scratches, dents, broken components)</li>
                <li>Water damage or exposure to moisture</li>
                <li>Theft or loss of equipment</li>
                <li>Damage from misuse or abuse</li>
                <li>Missing accessories or components</li>
                <li>Damage from exceeding equipment specifications</li>
              </ul>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Security Deposit</h3>
              <p className="text-gray-300 mb-3">
                A refundable security deposit is required for all rentals. The deposit amount varies based on the equipment value:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong className="text-neon-blue">Standard Equipment:</strong> $100 - $500 deposit</li>
                <li>• <strong className="text-neon-blue">Premium Equipment:</strong> $500 - $1,500 deposit</li>
                <li>• <strong className="text-neon-blue">Package Rentals:</strong> $200 - $1,000 deposit</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Deposits will be refunded within 5-7 business days after equipment return and inspection, 
                minus any charges for damage, missing items, or late fees.
              </p>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Damage Assessment</h3>
              <p className="text-gray-300 mb-3">
                All equipment is inspected before and after rental. Damage charges will be assessed based on:
              </p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Repair costs for damaged equipment</li>
                <li>Replacement cost for items beyond repair</li>
                <li>Replacement cost for missing accessories</li>
                <li>Labor costs for equipment restoration</li>
              </ul>
              <p className="text-red-300 mt-4 font-semibold">
                Note: Damage charges may exceed the security deposit amount. Additional charges will be billed separately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weather Policy */}
        <Card className="mb-6 border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant="popular" className="text-lg px-4 py-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                🌧️ Weather
              </Badge>
              <CardTitle className="text-2xl text-white">
                Weather Policy
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-deep-slate p-5 rounded-lg border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">Outdoor Event Protection</h3>
              <p className="text-gray-300 mb-4">
                Audio equipment is sensitive to weather conditions. The following policies apply:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <strong className="text-yellow-400">Rain Protection Required:</strong> All outdoor events must have 
                  adequate protection from rain, including covered stages, tents, or weatherproof enclosures.
                </li>
                <li>
                  <strong className="text-yellow-400">Equipment Must Stay Dry:</strong> Equipment exposed to rain or 
                  moisture will be considered damaged and repair/replacement costs will apply.
                </li>
                <li>
                  <strong className="text-yellow-400">Extreme Weather:</strong> In cases of severe weather warnings 
                  (hurricanes, tornadoes, etc.), we reserve the right to cancel or postpone delivery.
                </li>
                <li>
                  <strong className="text-yellow-400">Temperature Considerations:</strong> Equipment should not be 
                  exposed to temperatures below 32°F (0°C) or above 120°F (49°C) for extended periods.
                </li>
              </ul>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Cancellation Due to Weather</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Cancellations due to severe weather warnings: Full refund (minus processing fees)</li>
                <li>• Cancellations within 24 hours due to weather: 50% refund</li>
                <li>• No refund for cancellations due to light rain if adequate protection is available</li>
                <li>• Contact us immediately if weather conditions become unsafe</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Late Fee Structure */}
        <Card className="mb-6 border-orange-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant="popular" className="text-lg px-4 py-2 bg-orange-500/20 text-orange-400 border-orange-500/50">
                ⏰ Late Fees
              </Badge>
              <CardTitle className="text-2xl text-white">
                Late Fee Structure
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-deep-slate p-5 rounded-lg border border-orange-500/20">
              <p className="text-gray-300 mb-4">
                Equipment must be returned by the scheduled return date and time. Late returns will incur the following fees:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-charcoal rounded border border-orange-500/30">
                  <span className="text-orange-400 font-bold text-xl">$25</span>
                  <div>
                    <p className="text-white font-semibold">First Hour Late</p>
                    <p className="text-gray-400 text-sm">Applied for the first hour past the scheduled return time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-charcoal rounded border border-orange-500/30">
                  <span className="text-orange-400 font-bold text-xl">$10/hr</span>
                  <div>
                    <p className="text-white font-semibold">Each Additional Hour</p>
                    <p className="text-gray-400 text-sm">Charged for every hour after the first hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-charcoal rounded border border-red-500/30">
                  <span className="text-red-400 font-bold text-xl">$200</span>
                  <div>
                    <p className="text-white font-semibold">Maximum Late Fee</p>
                    <p className="text-gray-400 text-sm">Capped at $200 (20 hours late). After this, daily rental rates apply.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Late Fee Calculation Examples</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• <strong>30 minutes late:</strong> No fee (grace period)</p>
                <p>• <strong>1.5 hours late:</strong> $25 (first hour)</p>
                <p>• <strong>3 hours late:</strong> $25 + ($10 × 2) = $45</p>
                <p>• <strong>10 hours late:</strong> $25 + ($10 × 9) = $115</p>
                <p>• <strong>25 hours late:</strong> $200 (maximum) + additional daily rental fees</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
              <p className="text-yellow-300 font-semibold">
                💡 Tip: Contact us as soon as possible if you anticipate a late return. 
                We may be able to accommodate an extension if equipment is available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Terms */}
        <Card className="mb-6 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              General Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Equipment Use</h3>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Equipment must be used only for its intended purpose</li>
                <li>No modifications or alterations to equipment are permitted</li>
                <li>Equipment may not be subleased or transferred to third parties</li>
                <li>Follow all safety guidelines provided in the Setup Guide</li>
              </ul>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Insurance</h3>
              <p className="text-gray-300">
                Renters are encouraged to have their own insurance coverage for rented equipment. 
                Our security deposit does not replace insurance coverage for theft, loss, or catastrophic damage.
              </p>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Cancellation Policy</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>7+ days before pickup:</strong> Full refund (minus processing fees)</li>
                <li>• <strong>3-6 days before pickup:</strong> 50% refund</li>
                <li>• <strong>Less than 3 days:</strong> No refund (except for severe weather as noted above)</li>
              </ul>
            </div>

            <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Dispute Resolution</h3>
              <p className="text-gray-300">
                Any disputes regarding damage assessment, fees, or equipment condition must be reported within 
                48 hours of equipment return. We will work with you to resolve any issues fairly and promptly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <Card className="border-neon-blue/30">
          <CardContent className="pt-6">
            <div className="bg-neon-blue/10 p-6 rounded-lg border border-neon-blue/30 text-center">
              <p className="text-white text-lg font-semibold mb-2">
                By proceeding with your rental, you acknowledge that you have read, understood, 
                and agree to all terms and conditions outlined in this agreement.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                If you have any questions about this agreement, please contact us before booking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

