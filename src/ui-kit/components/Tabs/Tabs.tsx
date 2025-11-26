/**
 * Tabs component
 * Компонент для переключения между вкладками
 */

import React, { useState } from 'react'
import './Tabs.css'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '')
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onChange?.(tabId)
  }

  return (
    <div className={`ui-tabs ${className}`}>
      <div className="ui-tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ui-tabs__tab ${activeTab === tab.id ? 'ui-tabs__tab--active' : ''} ${tab.disabled ? 'ui-tabs__tab--disabled' : ''}`}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
          >
            {tab.icon && <span className="ui-tabs__icon">{tab.icon}</span>}
            <span className="ui-tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

