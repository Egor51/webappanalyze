/**
 * Analytics domain API
 * Все API-запросы для домена аналитики
 */

import { apiClient } from '../../lib/api-client'
import type { AnalyticsEvent } from './types'

/**
 * Отправить событие аналитики
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  // В production можно отправлять на сервер
  // Сейчас просто логируем в dev режиме
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', event.name, event.properties)
  }
  
  // TODO: Интеграция с аналитикой (Google Analytics, Яндекс.Метрика и т.д.)
  // await apiClient.post('/analytics/events', event)
}

