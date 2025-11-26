/**
 * Hook для отправки событий аналитики
 */

import { useMutation } from '@tanstack/react-query'
import { trackEvent } from '../api'
import type { AnalyticsEvent } from '../types'

export const useTrackEvent = () => {
  return useMutation({
    mutationFn: trackEvent,
    // Не нужно retry для аналитики
    retry: false,
  })
}

