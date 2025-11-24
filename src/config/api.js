/**
 * Конфигурация API endpoints
 * Используется для совместимости со старым кодом
 * Рекомендуется использовать apiClient из '../api/client'
 */

import { getApiBaseUrl as getBaseUrl } from '../api/client'

// Конфигурация API endpoints
export const API_CONFIG = {
  BASE_URL: 'https://murmanclick.ru',
  ENDPOINTS: {
    INVEST_TOP: '/ads/invest/top',
    INVEST_BY_BUDGET: '/ads/invest/top/by-budget',
    ANALYTIC_CITY: '/ads/analytic/city',
    ANALYTIC_DISTRICT: '/ads/analytic/district',
    ANALYTIC_ADDRESS: '/ads/analytic/v1.1',
    ANALYTIC_CITY_ALL: '/ads/analytic/city/all',
  }
}

// Экспортируем функцию для получения базового URL (для обратной совместимости)
export const getApiBaseUrl = getBaseUrl

// Функция для построения URL (для обратной совместимости)
export const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = getBaseUrl()
  const url = new URL(`${baseUrl}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

