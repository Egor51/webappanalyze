/**
 * React Query hook для получения лучших инвестиционных вариантов
 */

import { useQuery } from '@tanstack/react-query'
import { getTopInvestments } from '../api'
import { queryKeys } from '../../../lib/react-query'
import type { InvestmentOption } from '../types'

export const useTopInvestments = () => {
  return useQuery<InvestmentOption[]>({
    queryKey: queryKeys.investing.top(),
    queryFn: getTopInvestments,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

