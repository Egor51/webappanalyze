/**
 * React Query hook для автодополнения городов
 */

import { useQuery } from '@tanstack/react-query'
import { getCitySuggestions } from '../api'
import { queryKeys } from '../../../lib/react-query'
import { useDebounce } from '../../../hooks/useDebounce'

interface UseCitySuggestionsParams {
  query: string
  enabled?: boolean
}

export const useCitySuggestions = ({ query, enabled = true }: UseCitySuggestionsParams) => {
  const debouncedQuery = useDebounce(query, 300)
  
  return useQuery({
    queryKey: queryKeys.suggestions.cities(debouncedQuery),
    queryFn: () => getCitySuggestions(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 минуты для suggestions
  })
}

