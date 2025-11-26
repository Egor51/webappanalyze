/**
 * Централизованный API-клиент с кэшированием
 * Обеспечивает единую точку для всех API-запросов
 */

// Простой кэш в памяти с TTL
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 минут

// Получение базового URL
const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8081'
  }
  return 'https://murmanclick.ru'
}

// Генерация ключа кэша
const getCacheKey = (url, options = {}) => {
  const params = new URLSearchParams(options.params || {}).toString()
  return `${url}?${params}`
}

// Проверка валидности кэша
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) {
    return false
  }
  return Date.now() - cacheEntry.timestamp < CACHE_TTL
}

/**
 * Выполнение fetch-запроса с обработкой ошибок
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, fetchOptions)

    // Обработка статуса 204 (No Content)
    if (response.status === 204) {
      return { status: 204, data: null }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`)
    }

    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    // Детальная обработка ошибок сети и SSL
    const errorMessage = error.message || ''
    const errorName = error.name || ''
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

    // SSL/Certificate ошибки
    if (
      errorMessage.includes('CERT') ||
      errorMessage.includes('certificate') ||
      errorMessage.includes('ERR_CERT') ||
      errorMessage.includes('ERR_SSL') ||
      errorMessage.includes('TLS')
    ) {
      if (isChrome) {
        throw new Error(
          'Chrome блокирует подключение из-за проверки сертификата. Пожалуйста, используйте Safari или другой браузер.'
        )
      }
      throw new Error('Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже.')
    }

    // Сетевые ошибки
    if (
      errorName === 'TypeError' ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError')
    ) {
      if (navigator.onLine === false) {
        throw new Error('Нет подключения к интернету. Проверьте ваше соединение.')
      }
      if (isChrome && errorMessage.includes('Failed to fetch')) {
        throw new Error(
          'Chrome блокирует подключение. Возможна проблема с проверкой сертификата. Пожалуйста, используйте Safari или другой браузер.'
        )
      }
      throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.')
    }

    throw error
  }
}

/**
 * API-клиент с кэшированием
 */
export const apiClient = {
  /**
   * GET запрос с кэшированием
   * @param {string} endpoint - путь эндпоинта
   * @param {object} params - параметры запроса
   * @param {object} options - дополнительные опции (cache: false для отключения кэша)
   */
  async get(endpoint, params = {}, options = {}) {
    const baseUrl = getBaseUrl()
    const url = new URL(`${baseUrl}${endpoint}`)
    
    // Добавляем параметры в URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value)
      }
    })

    const cacheKey = getCacheKey(endpoint, { params })
    const useCache = options.cache !== false

    // Проверяем кэш
    if (useCache) {
      const cached = cache.get(cacheKey)
      if (isCacheValid(cached)) {
        // Cache hit - логирование не требуется в production
        return cached.data
      }
    }

    // Выполняем запрос
    // Логирование запросов не требуется в production

    const result = await fetchWithErrorHandling(url.toString(), options)

    // Сохраняем в кэш
    if (useCache && result.data) {
      cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
      })
    }

    return result.data
  },

  /**
   * POST запрос
   */
  async post(endpoint, data = {}, options = {}) {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}${endpoint}`

    const fetchOptions = {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    }

    const result = await fetchWithErrorHandling(url, fetchOptions)
    return result.data
  },

  /**
   * Очистка кэша
   */
  clearCache() {
    cache.clear()
  },

  /**
   * Очистка кэша для конкретного эндпоинта
   */
  clearCacheFor(endpoint) {
    for (const key of cache.keys()) {
      if (key.startsWith(endpoint)) {
        cache.delete(key)
      }
    }
  },
}

// Экспорт базового URL для использования в других местах
export const getApiBaseUrl = getBaseUrl

