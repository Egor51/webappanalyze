// Определение базового URL в зависимости от окружения
const getBaseUrl = () => {
  // В режиме разработки используем localhost
  if (import.meta.env.DEV) {
    const devUrl = 'http://localhost:8081'
    console.log('[API Config] Development mode: using', devUrl)
    return devUrl
  }
  // В продакшене используем production URL
  return 'https://murmanclick.ru'
}

// Конфигурация API endpoints
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    INVEST_TOP: '/ads/invest/top',
    INVEST_BY_BUDGET: '/ads/invest/top/by-budget',
    ANALYTIC_CITY: '/ads/analytic/city',
    ANALYTIC_DISTRICT: '/ads/analytic/district',
    ANALYTIC_ADDRESS: '/ads/analytic/v1.1',
    ANALYTIC_CITY_ALL: '/ads/analytic/city/all',
  }
}

// Экспортируем функцию для получения базового URL (для использования в других местах)
export const getApiBaseUrl = () => API_CONFIG.BASE_URL

// Функция для построения URL
export const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

