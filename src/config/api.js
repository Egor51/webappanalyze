// Конфигурация API endpoints
export const API_CONFIG = {
  BASE_URL: 'https://murmanclick.ru',
  ENDPOINTS: {
    INVEST_TOP: '/ads/invest/top',
    INVEST_BY_BUDGET: '/ads/invest/top/by-budget',
    ANALYTIC_CITY: '/ads/analytic/city',
    ANALYTIC_DISTRICT: '/ads/analytic/district',
    ANALYTIC_ADDRESS: '/ads/analytic/v1.1',
    ANALYTIC_CITY_ALL: '/ads/analytic/city/all',
  }
}

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

