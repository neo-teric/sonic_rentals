'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-6 py-4 text-lg md:text-xl font-semibold transition-all duration-300 relative',
              'border-b-4 border-transparent -mb-[2px]',
              'hover:text-neon-blue/80',
              activeTab === tab.id
                ? 'text-neon-blue border-neon-blue'
                : 'text-gray-400 hover:text-gray-300'
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="text-2xl">{tab.icon}</span>}
              <span>{tab.label}</span>
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-neon-blue shadow-lg shadow-neon-blue/50 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-[500px]">
        <div
          key={activeTab}
          className="animate-fade-in h-full"
        >
          {activeTabContent}
        </div>
      </div>
    </div>
  )
}

