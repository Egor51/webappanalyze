/**
 * Auth domain API
 * Все API-запросы для домена аутентификации
 */

import { apiClient } from '../../lib/api-client'
import type { InvestingAuthStatus } from './types'

/**
 * Проверить статус авторизации для инвестиций
 */
export const checkInvestingAuth = async (): Promise<InvestingAuthStatus> => {
  return apiClient.get('/ads/invest/auth')
}

