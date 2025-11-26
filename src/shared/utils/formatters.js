/**
 * Общие утилиты для форматирования данных
 * Централизованное место для всех форматирующих функций
 */

/**
 * Форматирование цены
 * @param {number|string} price - цена для форматирования
 * @param {object} options - опции форматирования
 * @returns {string} отформатированная цена
 */
export const formatPrice = (price, options = {}) => {
  const { showCurrency = true, decimals = 1 } = options

  if (price === null || price === undefined || price === 'no content') {
    return 'Нет данных'
  }

  if (typeof price === 'string') {
    // Если уже отформатировано, возвращаем как есть
    if (price.includes('млн') || price.includes('₽')) {
      return price
    }
    // Пытаемся распарсить число
    const numPrice = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'))
    if (isNaN(numPrice)) {
      return price
    }
    price = numPrice
  }

  if (typeof price === 'number') {
    if (price >= 1000000) {
      const formatted = `${(price / 1000000).toFixed(decimals)} млн`
      return showCurrency ? `${formatted} ₽` : formatted
    }
    const formatted = Math.round(price).toLocaleString('ru-RU')
    return showCurrency ? `${formatted} ₽` : formatted
  }

  return String(price)
}

/**
 * Форматирование процента
 * @param {number} percent - процент для форматирования
 * @returns {string} отформатированный процент
 */
export const formatPercent = (percent) => {
  if (percent === 0 || percent === null || percent === undefined) {
    return '0%'
  }
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

/**
 * Форматирование даты
 * @param {string|Date|Array} date - дата для форматирования
 * @param {object} options - опции форматирования
 * @returns {string} отформатированная дата
 */
export const formatDate = (date, options = {}) => {
  const { format = 'short' } = options

  if (!date) {
    return 'Нет данных'
  }

  let dateObj

  // Обработка массива [year, month, day]
  if (Array.isArray(date) && date.length >= 3) {
    const [year, month, day] = date
    dateObj = new Date(year, month - 1, day)
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (date instanceof Date) {
    dateObj = date
  } else {
    return 'Нет данных'
  }

  if (isNaN(dateObj.getTime())) {
    return 'Нет данных'
  }

  const formatOptions = {
    short: { month: 'short', year: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
  }

  return dateObj.toLocaleDateString('ru-RU', formatOptions[format] || formatOptions.short)
}

/**
 * Форматирование адреса
 * @param {string} address - адрес для форматирования
 * @returns {string} отформатированный адрес
 */
export const formatAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return ''
  }

  // Убираем лишние пробелы
  return address.trim().replace(/\s+/g, ' ')
}

/**
 * Нормализация адреса для поиска
 * Добавляет город и форматирует номер дома
 */
export const normalizeAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return ''
  }

  let fullAddress = address.trim()
  const addressLower = fullAddress.toLowerCase()

  // Список городов Мурманской области (кроме Мурманска)
  const otherCities = [
    'оленегорск',
    'апатиты',
    'кировск',
    'мончегорск',
    'полярные зори',
    'полярный',
    'североморск',
    'заозерск',
    'гаджиево',
    'снежногорск',
    'кандалакша',
    'кола',
    'порья губа',
    'заполярный',
    'печенга',
  ]

  // Проверяем, содержит ли адрес название другого города
  const hasOtherCity = otherCities.some((city) => addressLower.includes(city))
  const hasMurmansk = addressLower.includes('мурманск')

  // Добавляем "Мурманск" только если нет ни Мурманска, ни другого города
  if (!hasMurmansk && !hasOtherCity) {
    fullAddress = `Мурманск ${fullAddress}`
  }

  // Если в адресе нет "д" или "дом", добавляем "д"
  if (!fullAddress.match(/\s(д|дом)\s/i)) {
    const houseMatch = fullAddress.match(/\s(\d+)$/)
    if (houseMatch) {
      fullAddress = fullAddress.replace(/\s(\d+)$/, ' д $1')
    }
  }

  return fullAddress
}

/**
 * Генерация уникального ключа для списка элементов
 */
export const generateKey = (item, index, fields = ['id', 'url', 'fullAddress']) => {
  for (const field of fields) {
    if (item[field]) {
      return `${field}-${item[field]}`
    }
  }
  return `item-${index}`
}

