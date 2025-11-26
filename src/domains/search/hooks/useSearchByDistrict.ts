/**
 * React Query hook для поиска по району
 */

import { useQuery } from '@tanstack/react-query'
import { searchByDistrict } from '../api'
import { queryKeys } from '../../../lib/react-query'

interface UseSearchByDistrictParams {
  district: string
  countRoom?: string
  houseMaterial?: 'Новостройка' | 'Вторичка'
  enabled?: boolean
}

export const useSearchByDistrict = ({
  district,
  countRoom,
  houseMaterial,
  enabled = true,
}: UseSearchByDistrictParams) => {
  return useQuery({
    queryKey: queryKeys.search.byDistrict(district, countRoom, houseMaterial),
    queryFn: () => searchByDistrict(district, countRoom, houseMaterial),
    enabled: enabled && !!district && district.length > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

