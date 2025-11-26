/**
 * React Query hook для проверки авторизации инвестиций
 */

import { useQuery } from '@tanstack/react-query'
import { checkInvestingAuth } from '../api'
import { queryKeys } from '../../../lib/react-query'
import type { InvestingAuthStatus } from '../types'

export const useInvestingAuth = () => {
  return useQuery<InvestingAuthStatus>({
    queryKey: queryKeys.auth.investing(),
    queryFn: checkInvestingAuth,
    staleTime: 10 * 60 * 1000, // 10 минут (авторизация меняется редко)
  })
}

