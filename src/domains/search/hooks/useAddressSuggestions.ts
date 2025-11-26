/**
 * React Query hook для автодополнения адресов
 */

import { useQuery } from '@tanstack/react-query'
import { getAddressSuggestions } from '../api'
import { queryKeys } from '../../../lib/react-query'
import { useDebounce } from '../../../hooks/useDebounce'

interface UseAddressSuggestionsParams {
  query: string
  enabled?: boolean
}

export const useAddressSuggestions = ({ query, enabled = true }: UseAddressSuggestionsParams) => {
  const debouncedQuery = useDebounce(query, 300)
  
  return useQuery({
    queryKey: queryKeys.suggestions.addresses(debouncedQuery),
    queryFn: () => getAddressSuggestions(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 минуты для suggestions
  })
}

