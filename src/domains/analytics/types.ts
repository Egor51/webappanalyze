/**
 * Analytics domain types
 * Типы для домена аналитики и событий
 */

/**
 * Событие аналитики
 */
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: number
}

/**
 * События для отслеживания
 */
export type AnalyticsEventName =
  | 'search_completed'
  | 'investment_opened'
  | 'pdf_exported'
  | 'urgent_sale_application_sent'
  | 'address_suggestion_selected'
  | 'city_suggestion_selected'
  | 'investment_detail_viewed'
  | 'mandate_created'
  | 'mandate_updated'
  | 'mandate_deleted'

/**
 * Параметры события поиска
 */
export interface SearchCompletedEvent {
  searchType: 'address' | 'district' | 'city'
  query: string
  hasResults: boolean
  executionTime?: number
}

/**
 * Параметры события инвестиции
 */
export interface InvestmentOpenedEvent {
  investmentId: string | number
  source: 'top' | 'budget' | 'mandate'
}

/**
 * Параметры события экспорта PDF
 */
export interface PdfExportedEvent {
  reportType: 'address' | 'district' | 'city'
  address?: string
}

/**
 * Параметры события заявки на срочную продажу
 */
export interface UrgentSaleApplicationSentEvent {
  city: string
  objectType: string
}

