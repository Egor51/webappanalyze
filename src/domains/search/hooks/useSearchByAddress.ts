/**
 * React Query hook для поиска по адресу
 */

import { useQuery } from '@tanstack/react-query'
import { searchByAddress } from '../api'
import { queryKeys } from '../../../lib/react-query'
import { normalizeAddress } from '../../../shared/utils/formatters'

interface UseSearchByAddressParams {
  address: string
  countRoom: string
  enabled?: boolean
}

export const useSearchByAddress = ({ address, countRoom, enabled = true }: UseSearchByAddressParams) => {
  const normalizedAddress = normalizeAddress(address)
  
  return useQuery({
    queryKey: queryKeys.search.byAddress(normalizedAddress, countRoom),
    queryFn: () => searchByAddress(normalizedAddress, countRoom),
    enabled: enabled && !!address && !!countRoom && address.length > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

