/**
 * Хук для работы с API
 * Предоставляет состояние загрузки, ошибок и данных
 */

import { useState, useCallback, useRef } from 'react'
import { apiClient } from '../api/client'
import { normalizeAddress } from '../utils/formatters'

/**
 * Хук для выполнения API-запросов
 * @param {function} apiCall - функция, возвращающая Promise с данными
 * @param {object} options - опции хука
 */
export const useApi = (apiCall, options = {}) => {
  const { immediate = false, cache = true } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const execute = useCallback(
    async (...args) => {
      // Отменяем предыдущий запрос, если он еще выполняется
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Создаем новый AbortController
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setLoading(true)
      setError(null)

      try {
        const result = await apiCall(...args)
        
        // Проверяем, не был ли запрос отменен
        if (abortController.signal.aborted) {
          return
        }

        setData(result)
        return result
      } catch (err) {
        // Игнорируем ошибки отмены запроса
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return
        }

        setError(err)
        throw err
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [apiCall]
  )

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  // Выполняем запрос сразу, если immediate = true
  // useEffect(() => {
  //   if (immediate) {
  //     execute()
  //   }
  // }, [immediate, execute])

  // Очистка при размонтировании
  // useEffect(() => {
  //   return () => {
  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort()
  //     }
  //   }
  // }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * Хук для поиска по адресу
 */
export const useAddressSearch = () => {
  return useApi(
    async (address, countRoom) => {
      const normalizedAddress = normalizeAddress(address)
      const endpoint = '/ads/analytic/v1.1'
      const params = {
        street: normalizedAddress,
        countRoom,
      }
      return apiClient.get(endpoint, params)
    },
    { cache: true }
  )
}

/**
 * Хук для поиска по району
 */
export const useDistrictSearch = () => {
  return useApi(
    async (district, countRoom, houseMaterial) => {
      const endpoint = '/ads/analytic/district'
      const params = {
        district,
        ...(countRoom && countRoom !== 'Весь' && { countRoom }),
        ...(houseMaterial && { houseMaterial }),
      }
      return apiClient.get(endpoint, params)
    },
    { cache: true }
  )
}

/**
 * Хук для поиска по городу
 */
export const useCitySearch = () => {
  return useApi(
    async (city, countRoom, houseMaterial) => {
      const endpoint = '/ads/analytic/city'
      const params = {
        city,
        ...(countRoom && countRoom !== 'Весь' && { countRoom }),
        ...(houseMaterial && { houseMaterial }),
      }
      return apiClient.get(endpoint, params)
    },
    { cache: true }
  )
}

