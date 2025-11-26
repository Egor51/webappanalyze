/**
 * Investing domain API
 * Все API-запросы для инвестиционного домена
 */

import { apiClient } from '../../lib/api-client'
import type { InvestmentOption, InvestmentSearchParams } from './types'

/**
 * Получить лучшие инвестиционные варианты
 */
export const getTopInvestments = async (): Promise<InvestmentOption[]> => {
  return apiClient.get('/ads/invest/top')
}

/**
 * Получить инвестиционные варианты по бюджету
 */
export const getInvestmentsByBudget = async (
  budget: number
): Promise<InvestmentOption[]> => {
  return apiClient.get('/ads/invest/top/by-budget', { budget })
}

/**
 * Получить инвестиционные варианты с фильтрацией по мандату
 */
export const getInvestmentsByMandate = async (
  mandateId: string | number
): Promise<InvestmentOption[]> => {
  return apiClient.get('/ads/invest/top/by-mandate', { mandateId })
}

