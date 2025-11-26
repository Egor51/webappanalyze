/**
 * React Query hook для поиска по городу
 */

import { useQuery } from '@tanstack/react-query'
import { searchByCity } from '../api'
import { queryKeys } from '../../../lib/react-query'

interface UseSearchByCityParams {
  city: string
  countRoom?: string
  houseMaterial?: 'Новостройка' | 'Вторичка'
  enabled?: boolean
}

export const useSearchByCity = ({
  city,
  countRoom,
  houseMaterial,
  enabled = true,
}: UseSearchByCityParams) => {
  return useQuery({
    queryKey: queryKeys.search.byCity(city, countRoom, houseMaterial),
    queryFn: () => searchByCity(city, countRoom, houseMaterial),
    enabled: enabled && !!city && city.length > 0,
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

