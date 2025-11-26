/**
 * React Query mutation для выполнения поиска
 * Используется для ручного запуска поиска (не автоматического)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { searchByAddress, searchByDistrict, searchByCity } from '../api'
import { queryKeys } from '../../../lib/react-query'
import { normalizeAddress } from '../../../shared/utils/formatters'
import { saveSearchToHistory } from '../../../shared/utils/searchHistory'

interface SearchParams {
  address: string
  countRoom: string
  searchType: 'address' | 'district' | 'city'
  propertyType?: 'all' | 'new' | 'secondary'
}

interface SearchMutationResult {
  data: unknown
  error: Error | null
  isLoading: boolean
}

export const useSearchMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ address, countRoom, searchType, propertyType = 'all' }: SearchParams) => {
      const originalAddress = address.trim()
      const shouldIncludeCountRoom = countRoom !== 'Весь' && countRoom !== 'Весь район' && countRoom !== 'Весь город'
      const houseMaterialValue = propertyType === 'new' ? 'Новостройка' : propertyType === 'secondary' ? 'Вторичка' : null

      let data

      if (searchType === 'city') {
        data = await searchByCity(
          originalAddress,
          shouldIncludeCountRoom ? countRoom : undefined,
          houseMaterialValue || undefined
        )
      } else if (searchType === 'district') {
        data = await searchByDistrict(
          originalAddress,
          shouldIncludeCountRoom ? countRoom : undefined,
          houseMaterialValue || undefined
        )
      } else {
        const fullAddress = normalizeAddress(originalAddress)
        data = await searchByAddress(fullAddress, countRoom)
      }

      // Обработка статуса 204 (данные не найдены)
      if (data === null) {
        return { data: null, isEmpty: true }
      }

      // Проверяем данные
      if (!data) {
        throw new Error('Данные не найдены')
      }

      if (Array.isArray(data) && data.length === 0) {
        throw new Error('Данные не найдены')
      }

      if (!Array.isArray(data) && !data.address && !data.price) {
        throw new Error('Данные не найдены')
      }

      // Сохраняем поиск в историю только для адресов (асинхронно, не блокируем)
      if (searchType === 'address') {
        // Не ждем завершения, выполняем асинхронно
        saveSearchToHistory(originalAddress, countRoom).catch(() => {
          // Игнорируем ошибки сохранения истории
        })
      }

      return { data, isEmpty: false }
    },
    onSuccess: (result, variables) => {
      // Инвалидируем соответствующие query для обновления кэша
      if (variables.searchType === 'address') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.search.byAddress(variables.address, variables.countRoom),
        })
      } else if (variables.searchType === 'district') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.search.byDistrict(variables.address),
        })
      } else if (variables.searchType === 'city') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.search.byCity(variables.address),
        })
      }
    },
  })
}

