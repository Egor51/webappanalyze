/**
 * Urgent Sale domain API
 * Все API-запросы для домена срочной продажи
 */

import { apiClient } from '../../lib/api-client'
import type { UrgentSaleFormData, UrgentSaleFormResponse } from './types'

/**
 * Отправить заявку на срочную продажу
 */
export const submitUrgentSaleForm = async (
  formData: UrgentSaleFormData
): Promise<UrgentSaleFormResponse> => {
  return apiClient.post('/ads/urgent-sale/application', formData)
}

