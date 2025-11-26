/**
 * Утилита для получения прогноза цены через ML (GPT-4o)
 */

/**
 * Получает прогноз цены через ML вебхук
 * @param {Array} analytics - Исторические данные о ценах
 * @param {String} address - Адрес недвижимости
 * @returns {Promise<Object>} - Прогноз на 3, 6 и 12 месяцев
 */
export async function getMLForecast(analytics, address) {
  try {
    // Подготавливаем данные для отправки - явно преобразуем в простые типы
    const historicalData = analytics
      .map(item => ({
        date: String(item.date || ''),
        avgPrice: Number(item.avgPrice) || 0
      }))
      .filter(item => item.date && item.avgPrice > 0)

    // Формируем данные для отправки
    const requestData = {
      address: String(address || ''),
      historicalData: historicalData,
      // Добавляем исторические данные в виде JSON строки для промпта
      historicalDataString: JSON.stringify(historicalData, null, 2)
    }

    console.log('Отправка данных на вебхук:', {
      address: requestData.address,
      dataPoints: historicalData.length,
      sample: historicalData.slice(0, 3)
    })

    const response = await fetch('https://my-traffic.space/webhook/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения прогноза: ${response.status}`)
    }

    const data = await response.json()
    
    // Обработка разных форматов ответа от n8n
    // Формат 1: массив с объектом output (стандартный n8n формат)
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      console.log('Получен ответ в формате n8n (массив с output)')
      return data[0].output
    }
    
    // Формат 2: прямой объект с forecast
    if (data && data.forecast) {
      console.log('Получен ответ в прямом формате')
      return data
    }
    
    // Если формат не распознан, логируем и возвращаем как есть
    console.warn('Неожиданный формат ответа от webhook:', data)
    return data
  } catch (error) {
    console.error('Ошибка при получении прогноза через ML:', error)
    throw error
  }
}

/**
 * Линейная интерполяция между двумя точками
 */
function interpolate(startValue, endValue, startMonth, endMonth, targetMonth) {
  if (endMonth === startMonth) {
return startValue
}
  const ratio = (targetMonth - startMonth) / (endMonth - startMonth)
  return startValue + (endValue - startValue) * ratio
}

/**
 * Форматирует прогноз для отображения на графике
 * @param {Object} forecastData - Данные прогноза от ML
 * @param {String} lastHistoricalDate - Последняя дата из истории
 * @param {Number} lastPrice - Последняя цена из истории
 * @returns {Array} - Массив точек для графика
 */
export function formatForecastForChart(forecastData, lastHistoricalDate, lastPrice) {
  if (!forecastData || !forecastData.forecast) {
    return []
  }

  const forecast = forecastData.forecast
  const chartData = []
  const lastDate = new Date(lastHistoricalDate)

  // Создаем точки для плавной линии: 0, 3, 6, 12 месяцев
  const points = [
    { month: 0, price: lastPrice }, // Текущая цена
    ...(forecast.month3 ? [{ month: 3, price: forecast.month3 }] : []),
    ...(forecast.month6 ? [{ month: 6, price: forecast.month6 }] : []),
    ...(forecast.month12 ? [{ month: 12, price: forecast.month12 }] : [])
  ]

  // Сортируем точки по месяцам
  points.sort((a, b) => a.month - b.month)

  // Создаем точки для каждого месяца (для плавной линии)
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const date = new Date(lastDate)
    date.setMonth(date.getMonth() + point.month)
    
    chartData.push({
      date: date.toISOString(),
      price: point.price,
      isForecast: point.month > 0,
      period: point.month === 3 ? '3 месяца' : 
              point.month === 6 ? '6 месяцев' : 
              point.month === 12 ? '12 месяцев' : null
    })

    // Добавляем промежуточные точки для плавной линии (между основными точками)
    if (i < points.length - 1) {
      const nextPoint = points[i + 1]
      const monthsBetween = nextPoint.month - point.month
      
      // Добавляем промежуточные точки каждые 1-2 месяца
      const step = monthsBetween <= 3 ? 1 : 2
      for (let m = point.month + step; m < nextPoint.month; m += step) {
        const interpolatedPrice = interpolate(point.price, nextPoint.price, point.month, nextPoint.month, m)
        const intermediateDate = new Date(lastDate)
        intermediateDate.setMonth(intermediateDate.getMonth() + m)
        
        chartData.push({
          date: intermediateDate.toISOString(),
          price: interpolatedPrice,
          isForecast: true,
          period: null
        })
      }
    }
  }

  return chartData.sort((a, b) => new Date(a.date) - new Date(b.date))
}

