/**
 * Утилиты для валидации и нормализации данных инвестиций
 */

/**
 * Валидация и нормализация объекта инвестиции
 * @param {Object} option - Объект инвестиции с сервера
 * @returns {Object|null} - Нормализованный объект или null если данные невалидны
 */
export const validateAndNormalizeInvestmentOption = (option) => {
  if (!option || typeof option !== 'object') {
    console.warn('Invalid investment option: not an object', option)
    return null
  }

  // Базовые обязательные поля
  if (!option.fullAddress && !option.address) {
    console.warn('Invalid investment option: missing address', option)
    return null
  }

  // Нормализация данных
  const normalized = {
    // Адрес
    fullAddress: option.fullAddress || option.address || 'Адрес не указан',
    
    // Площадь
    square: typeof option.square === 'number' && option.square > 0 
      ? option.square 
      : (typeof option.area === 'number' && option.area > 0 ? option.area : null),
    
    // Количество комнат
    countRoom: option.countRoom || option.rooms || null,
    
    // Цена
    price: typeof option.price === 'number' && option.price > 0 
      ? option.price 
      : null,
    
    // URL объявления
    url: option.url || null,
    
    // Процент разницы с рынком
    differencePercent: typeof option.differencePercent === 'number' 
      ? option.differencePercent 
      : null,
    
    // Аналитика
    analyticsResponse: validateAnalyticsResponse(option.analyticsResponse),
  }

  // Проверка наличия хотя бы цены или аналитики
  if (!normalized.price && !normalized.analyticsResponse) {
    console.warn('Invalid investment option: missing price and analytics', option)
    return null
  }

  return normalized
}

/**
 * Валидация ответа аналитики
 * @param {Object} analyticsResponse - Объект аналитики
 * @returns {Object|null} - Валидированный объект или null
 */
export const validateAnalyticsResponse = (analyticsResponse) => {
  if (!analyticsResponse || typeof analyticsResponse !== 'object') {
    return null
  }

  const validated = {
    address: analyticsResponse.address || null,
    price: analyticsResponse.price || null,
    priceMeter: analyticsResponse.priceMeter || null,
    priceMin: analyticsResponse.priceMin || null,
    priceMax: analyticsResponse.priceMax || null,
    annualPriceChangePercent: typeof analyticsResponse.annualPriceChangePercent === 'number'
      ? analyticsResponse.annualPriceChangePercent
      : null,
    threeMonthPriceChangePercent: typeof analyticsResponse.threeMonthPriceChangePercent === 'number'
      ? analyticsResponse.threeMonthPriceChangePercent
      : null,
    analytics: validateAnalyticsArray(analyticsResponse.analytics),
  }

  // Проверяем, есть ли хотя бы какие-то данные
  const hasData = validated.price || 
                  validated.priceMeter || 
                  validated.annualPriceChangePercent !== null ||
                  validated.threeMonthPriceChangePercent !== null ||
                  (validated.analytics && validated.analytics.length > 0)

  return hasData ? validated : null
}

/**
 * Валидация массива аналитики для графика
 * @param {Array} analytics - Массив данных аналитики
 * @returns {Array} - Валидированный массив
 */
export const validateAnalyticsArray = (analytics) => {
  if (!Array.isArray(analytics)) {
    return []
  }

  return analytics
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null
      }

      // Проверяем наличие даты и цены
      if (!item.date || (typeof item.avgPrice !== 'number' && typeof item.price !== 'number')) {
        return null
      }

      // Нормализуем данные
      const price = typeof item.avgPrice === 'number' ? item.avgPrice : item.price
      
      // Проверяем валидность даты
      const date = new Date(item.date)
      if (isNaN(date.getTime())) {
        return null
      }

      return {
        date: item.date,
        price: price,
        avgPrice: price, // Для совместимости
      }
    })
    .filter(item => item !== null)
    .sort((a, b) => {
      // Сортируем по дате
      return new Date(a.date) - new Date(b.date)
    })
}

/**
 * Валидация массива инвестиционных опций
 * @param {Array} options - Массив опций
 * @returns {Array} - Массив валидированных опций
 */
export const validateInvestmentOptionsArray = (options) => {
  if (!Array.isArray(options)) {
    console.warn('Invalid options: not an array', options)
    return []
  }

  const validated = options
    .map((option, index) => {
      const normalized = validateAndNormalizeInvestmentOption(option)
      if (!normalized) {
        console.warn(`Skipping invalid option at index ${index}:`, option)
      }
      return normalized
    })
    .filter(option => option !== null)

  if (validated.length === 0 && options.length > 0) {
    console.error('All investment options were invalid', options)
  }

  return validated
}

/**
 * Получение статистики по данным
 * @param {Array} options - Массив опций
 * @returns {Object} - Статистика
 */
export const getInvestmentDataStats = (options) => {
  if (!Array.isArray(options) || options.length === 0) {
    return {
      total: 0,
      withPrice: 0,
      withAnalytics: 0,
      withChart: 0,
      averagePrice: null,
      priceRange: { min: null, max: null },
    }
  }

  const prices = options
    .map(opt => opt.price)
    .filter(price => typeof price === 'number' && price > 0)

  const withAnalytics = options.filter(opt => opt.analyticsResponse !== null).length
  const withChart = options.filter(opt => 
    opt.analyticsResponse?.analytics && opt.analyticsResponse.analytics.length > 0
  ).length

  return {
    total: options.length,
    withPrice: prices.length,
    withAnalytics,
    withChart,
    averagePrice: prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
      : null,
    priceRange: prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
        }
      : { min: null, max: null },
  }
}

