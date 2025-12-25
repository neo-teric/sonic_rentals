'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'

export default function SetupGuidePage() {
  const tabs = [
    {
      id: 'critical',
      label: 'Critical',
      icon: '⚡',
      content: (
        <div>
          <Card className="mb-6 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="popular" className="text-lg px-4 py-2 bg-gray-700/50 text-gray-300 border-gray-600">
                  ⚡ Critical
                </Badge>
                <CardTitle className="text-2xl text-white">
                  Power Rule: Source ON First, Speakers LAST
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-lg">
                This is the most important rule in audio equipment operation. Following this prevents damage to your speakers and equipment.
              </p>
              <div className="bg-deep-slate p-6 rounded-lg border border-neon-blue/20">
                <h3 className="text-xl font-semibold text-white mb-4">Power-Up Sequence:</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-300">
                  <li className="text-lg">
                    <strong className="text-neon-blue">Turn ON all source equipment first</strong> (mixers, audio interfaces, computers, phones, etc.)
                  </li>
                  <li className="text-lg">
                    <strong className="text-neon-blue">Set all volume levels to ZERO</strong> before connecting speakers
                  </li>
                  <li className="text-lg">
                    <strong className="text-neon-blue">Turn ON speakers LAST</strong> - This prevents power surges and pops that can damage speakers
                  </li>
                </ol>
              </div>
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <p className="text-red-300 font-semibold">
                  ⚠️ WARNING: Never turn speakers on before sources are powered and volume is at zero. This can cause permanent damage to your speakers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'audio-quality',
      label: 'Audio Quality',
      icon: '🔊',
      content: (
        <div>
          <Card className="mb-6 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="popular" className="text-lg px-4 py-2 bg-gray-700/50 text-gray-300 border-gray-600">
                  🔊 Audio Quality
                </Badge>
                <CardTitle className="text-2xl text-white">
                  "No Red" Clipping Prevention Guide
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-lg">
                Clipping occurs when audio signals exceed the maximum level, causing distortion and potential equipment damage. Keep your levels in the green/yellow zones.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-deep-slate p-5 rounded-lg border border-cyber-green/20">
                  <h3 className="text-lg font-semibold text-cyber-green mb-3">✅ Safe Levels</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong className="text-cyber-green">Green Zone:</strong> -12dB to -6dB (Ideal)</li>
                    <li>• <strong className="text-yellow-400">Yellow Zone:</strong> -6dB to -3dB (Acceptable)</li>
                    <li>• <strong className="text-orange-400">Orange Zone:</strong> -3dB to 0dB (Caution)</li>
                  </ul>
                </div>
                <div className="bg-deep-slate p-5 rounded-lg border border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">❌ Dangerous Levels</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong className="text-red-400">Red Zone:</strong> Above 0dB (CLIPPING)</li>
                    <li>• Causes distortion and harsh sound</li>
                    <li>• Can damage speakers and amplifiers</li>
                    <li>• Always reduce gain/volume if you see red</li>
                  </ul>
                </div>
              </div>
              <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">How to Prevent Clipping:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Start with all gain/volume controls at minimum</li>
                  <li>Slowly increase levels while monitoring meters</li>
                  <li>If you see red, immediately reduce the gain</li>
                  <li>Use limiters/compressors if available</li>
                  <li>Never push levels into the red zone intentionally</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'safety',
      label: 'Safety Instructions',
      icon: '⚠️',
      content: (
        <div>
          <Card className="mb-6 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Safety Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tripod Stability */}
              <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🎚️</span>
                  Tripod & Stand Stability
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Always extend tripod legs fully and lock them securely</li>
                  <li>• Ensure all three legs are on solid, level ground</li>
                  <li>• Use sandbags or weights on tripod legs for outdoor events</li>
                  <li>• Never place tripods on unstable surfaces (tables, chairs, etc.)</li>
                  <li>• Check stability before mounting equipment</li>
                  <li>• Keep tripods away from high-traffic areas</li>
                  <li>• Inspect tripod locks and mechanisms before use</li>
                </ul>
              </div>

              {/* Cable Management */}
              <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🔌</span>
                  Cable Taping & Management
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Always tape down cables in high-traffic areas</li>
                  <li>• Use gaff tape (not duct tape) to avoid residue</li>
                  <li>• Run cables along walls or under carpets when possible</li>
                  <li>• Create clear pathways - never block exits or walkways</li>
                  <li>• Use cable ramps for areas with vehicle traffic</li>
                  <li>• Label cables at both ends for easy identification</li>
                  <li>• Coil excess cable neatly - don't create tripping hazards</li>
                  <li>• Check cables for damage before use (frayed, kinked, or exposed wires)</li>
                </ul>
              </div>

              {/* General Safety */}
              <div className="bg-deep-slate p-5 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <span>⚠️</span>
                  General Safety Guidelines
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Keep all equipment dry - never expose to rain or moisture</li>
                  <li>• Ensure proper ventilation around amplifiers and power supplies</li>
                  <li>• Use appropriate power cables and never overload circuits</li>
                  <li>• Keep food and beverages away from equipment</li>
                  <li>• Handle equipment with care - avoid dropping or rough handling</li>
                  <li>• Report any damaged equipment immediately</li>
                  <li>• Follow all local electrical codes and regulations</li>
                  <li>• Have a fire extinguisher nearby for large events</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card className="border-neon-blue/30">
            <CardHeader>
              <CardTitle className="text-2xl text-neon-blue">
                Quick Reference Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-deep-slate p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Before Setup:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>☐ Inspect all equipment for damage</li>
                    <li>☐ Check all cables and connections</li>
                    <li>☐ Verify power requirements</li>
                    <li>☐ Plan cable routing paths</li>
                    <li>☐ Ensure stable surface for tripods</li>
                  </ul>
                </div>
                <div className="bg-deep-slate p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">During Operation:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>☐ Monitor levels - keep out of red</li>
                    <li>☐ Check for overheating equipment</li>
                    <li>☐ Ensure cables remain secure</li>
                    <li>☐ Watch for tripping hazards</li>
                    <li>☐ Monitor power consumption</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <main className="min-h-screen py-12 px-8 bg-charcoal">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-cyber-green to-neon-blue bg-clip-text text-transparent">
            Setup Guide
          </h1>
          <p className="text-xl text-gray-400">
            Essential safety and operational guidelines for professional audio equipment
          </p>
        </div>

        <div className="bg-deep-slate border border-gray-700 rounded-lg p-6 shadow-lg">
          <Tabs tabs={tabs} defaultTab="critical" />
        </div>
      </div>
    </main>
  )
}
