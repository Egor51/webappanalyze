/**
 * TypeScript типы для API-ответов и запросов
 * Постепенная миграция на TypeScript
 */

// Базовые типы
export type ApiResponse<T> = T | null
export type ApiError = {
  message: string
  status?: number
  code?: string
}

// Аналитика недвижимости
export interface AnalyticsDataPoint {
  date: string
  avgPrice: number
}

export interface PropertyAnalytics {
  address: string
  price: string
  priceMeter: string
  priceMin: string
  priceMax: string
  annualPriceChangePercent: number
  threeMonthPriceChangePercent: number
  analytics: AnalyticsDataPoint[]
}

export type PropertyAnalyticsResponse = PropertyAnalytics | PropertyAnalytics[]

// Аналитика городов
export interface CityAnalytics {
  city: string
  avgPrice: number | string
  priceMeter?: string
  priceChangePercent?: number
  annualPriceChangePercent?: number
  threeMonthPriceChangePercent?: number
  countRoom?: string
  price?: string
}

export interface CitiesAnalyticsResponse {
  content: CityAnalytics[]
  totalElements: number
  totalPages: number
  page?: number
  size?: number
}

// Инвестиции
export interface InvestmentOption {
  id?: string | number
  fullAddress: string
  square: number
  countRoom: string
  price: number
  differencePercent: number
  url: string
  analyticsResponse?: PropertyAnalytics
}

export type InvestmentOptionsResponse = InvestmentOption[]

// Автодополнение
export type AddressSuggestion = string
export type CitySuggestion = string

// Telegram Web App
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

// Webhook данные
export interface WebhookData {
  telegramId: number | null
  address: string
  countRoom: string
  firstName: string | null
}

// Поисковые параметры
export interface SearchParams {
  street?: string
  city?: string
  district?: string
  countRoom?: string
  houseMaterial?: 'Новостройка' | 'Вторичка'
}

// API Endpoints
export type ApiEndpoint = 
  | '/ads/analytic/v1.1'
  | '/ads/analytic/city'
  | '/ads/analytic/district'
  | '/ads/analytic/city/all'
  | '/ads/address/suggestion'
  | '/ads/address/city'
  | '/ads/invest/top'
  | '/ads/invest/top/by-budget'
  | '/ads/invest/auth'

