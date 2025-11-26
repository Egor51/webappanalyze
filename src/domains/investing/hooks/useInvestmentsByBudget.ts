/**
 * React Query hook для получения инвестиционных вариантов по бюджету
 */

import { useQuery } from '@tanstack/react-query'
import { getInvestmentsByBudget } from '../api'
import { queryKeys } from '../../../lib/react-query'
import type { InvestmentOption } from '../types'

interface UseInvestmentsByBudgetParams {
  budget: number
  enabled?: boolean
}

export const useInvestmentsByBudget = ({ budget, enabled = true }: UseInvestmentsByBudgetParams) => {
  return useQuery<InvestmentOption[]>({
    queryKey: queryKeys.investing.byBudget(budget),
    queryFn: () => getInvestmentsByBudget(budget),
    enabled: enabled && budget > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

