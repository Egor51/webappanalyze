/**
 * TypeScript типы для компонентов
 */

import { PropertyAnalytics, PropertyAnalyticsResponse } from './api'
import { InvestmentOption } from './api'

// Results component
export interface ResultsProps {
  data: PropertyAnalyticsResponse
  onNewSearch: () => void
}

// CitiesAnalytics component
export interface CitiesAnalyticsProps {
  data: {
    content: Array<{
      city: string
      avgPrice: number | string
      priceMeter?: string
      priceChangePercent?: number
      annualPriceChangePercent?: number
      threeMonthPriceChangePercent?: number
      countRoom?: string
    }>
    totalElements: number
    totalPages: number
  }
  onBack: () => void
}

// SearchForm component
export type SearchType = 'address' | 'district' | 'city'
export type PropertyType = 'all' | 'new' | 'secondary'

export interface SearchFormProps {
  onSearch: (address: string, countRoom: string, searchType: SearchType, propertyType: PropertyType) => void
  searchType?: SearchType
  onSearchTypeChange?: (type: SearchType) => void
  onGetAllCities?: () => void
}

// Investing component
export interface InvestingProps {
  // Props если нужны
}

// InvestmentDetailView component
export interface InvestmentDetailViewProps {
  option: InvestmentOption | null
  onBack: () => void
}

// PushNotification component
export interface PushNotificationProps {
  appName?: string
  title: string
  message?: string
  icon: React.ReactNode
  iconClassName?: string
  onClose: () => void
  onClick?: () => void
  show: boolean
  index?: number
}

// Header component
export type ScreenType = 'search' | 'investing' | 'urgent-buy'

export interface HeaderProps {
  currentScreen: ScreenType
  onNavigateToInvesting: () => void
  onNavigateToSearch: () => void
  onNavigateToUrgentBuy: () => void
}

// UrgentBuyPage component
export interface UrgentBuyPageProps {
  onNavigateToSearch: () => void
  onNavigateToInvesting: () => void
}

// ForecastChart component
export interface ForecastChartProps {
  historical: Array<{ date: string; price: number }>
  forecast: Array<{ date: string; price: number }>
}

// PriceForecast component
import type { AnalyticsDataPoint } from './api'

export interface PriceForecastProps {
  historicalData: AnalyticsDataPoint[]
  onForecastComplete?: (forecast: Array<{ date: string; price: number }>) => void
}

