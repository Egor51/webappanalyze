/**
 * Investing domain types
 * Типы для инвестиционного домена
 */

/**
 * Инвестиционный вариант
 */
export interface InvestmentOption {
  // Основная информация
  fullAddress: string
  square: number | null
  countRoom: string | number | null
  price: number | null
  url: string | null
  
  // Аналитика цен
  differencePercent: number | null
  
  // Детальная аналитика
  analyticsResponse: {
    address: string
    price: string
    priceMeter: string
    priceMin: string
    priceMax: string
    annualPriceChangePercent: number
    threeMonthPriceChangePercent: number
    analytics: Array<{
      date: string
      avgPrice: number
    }>
  } | null
}

/**
 * Параметры поиска инвестиций
 */
export interface InvestmentSearchParams {
  budget?: number
  mandateId?: string | number
}

/**
 * Мандат для фильтрации инвестиций
 */
export interface Mandate {
  id: string | number
  name: string
  strategy: 'rent' | 'flip' | 'parking'
  budgetMin?: number
  budgetMax?: number
  targetYield?: number
  maxRisk?: 'LOW' | 'MEDIUM' | 'HIGH'
  excludeOldBuildings?: boolean
  cities?: string[]
  districts?: string[]
  propertyTypes?: string[]
  isActive?: boolean
  matchCount?: number
  createdAt?: string
  updatedAt?: string
}

