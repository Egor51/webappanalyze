/**
 * Тестовые данные для сервиса инвестиций
 * Используются для разработки и тестирования без реального API
 */

// Тестовые данные для поиска по сумме
export const mockInvestmentOptions = [
  {
    id: 1,
    address: "Мурманск, ул. Ленина, д. 72",
    location: "Мурманск, ул. Ленина, д. 72",
    type: "Квартира, 2 комнаты",
    price: 4500000,
    expectedReturn: 12.5,
    growth: 8.3,
    area: 45,
    floor: 5,
    totalFloors: 9,
    year: 2015,
    description: "Удобная планировка, хорошая транспортная доступность"
  },
  {
    id: 2,
    address: "Мурманск, пр-т Ленина, д. 52",
    location: "Мурманск, пр-т Ленина, д. 52",
    type: "Квартира, 1 комната",
    price: 3200000,
    expectedReturn: 15.2,
    growth: 10.5,
    area: 32,
    floor: 3,
    totalFloors: 5,
    year: 2018,
    description: "Новостройка, отличное расположение в центре"
  },
  {
    id: 3,
    address: "Мурманск, ул. Пушкинская, д. 15",
    location: "Мурманск, ул. Пушкинская, д. 15",
    type: "Квартира, 3 комнаты",
    price: 6800000,
    expectedReturn: 11.8,
    growth: 7.2,
    area: 68,
    floor: 7,
    totalFloors: 10,
    year: 2012,
    description: "Просторная квартира, вид на море"
  },
  {
    id: 4,
    address: "Мурманск, район Октябрьский",
    location: "Мурманск, район Октябрьский",
    type: "Район",
    price: 5000000,
    expectedReturn: 13.5,
    growth: 9.1,
    averagePrice: 4800000,
    propertiesCount: 45,
    description: "Перспективный район с развитой инфраструктурой"
  },
  {
    id: 5,
    address: "Мурманск, ул. Коминтерна, д. 8",
    location: "Мурманск, ул. Коминтерна, д. 8",
    type: "Квартира, 2 комнаты",
    price: 4200000,
    expectedReturn: 14.0,
    growth: 8.7,
    area: 42,
    floor: 2,
    totalFloors: 5,
    year: 2016,
    description: "Тихий район, рядом школа и детский сад"
  },
  {
    id: 6,
    address: "Мурманск, ул. Софьи Перовской, д. 25",
    location: "Мурманск, ул. Софьи Перовской, д. 25",
    type: "Квартира, 1 комната",
    price: 2800000,
    expectedReturn: 16.5,
    growth: 11.2,
    area: 28,
    floor: 4,
    totalFloors: 9,
    year: 2019,
    description: "Студия в новом доме, подходит для сдачи в аренду"
  },
  {
    id: 7,
    address: "Мурманск, район Первомайский",
    location: "Мурманск, район Первомайский",
    type: "Район",
    price: 4500000,
    expectedReturn: 12.8,
    growth: 7.9,
    averagePrice: 4400000,
    propertiesCount: 38,
    description: "Стабильный район с хорошей транспортной доступностью"
  },
  {
    id: 8,
    address: "Мурманск, ул. Книповича, д. 12",
    location: "Мурманск, ул. Книповича, д. 12",
    type: "Дом",
    price: 8500000,
    expectedReturn: 10.5,
    growth: 6.8,
    area: 120,
    landArea: 600,
    year: 2010,
    description: "Частный дом с участком, подходит для семьи"
  },
  {
    id: 9,
    address: "Мурманск, ул. Свердлова, д. 30",
    location: "Мурманск, ул. Свердлова, д. 30",
    type: "Квартира, 2 комнаты",
    price: 4800000,
    expectedReturn: 13.2,
    growth: 8.5,
    area: 48,
    floor: 6,
    totalFloors: 12,
    year: 2014,
    description: "Современная планировка, панорамные окна"
  },
  {
    id: 10,
    address: "Мурманск, район Ленинский",
    location: "Мурманск, район Ленинский",
    type: "Район",
    price: 5200000,
    expectedReturn: 11.5,
    growth: 7.5,
    averagePrice: 5100000,
    propertiesCount: 52,
    description: "Центральный район, высокая ликвидность"
  }
]

// Тестовые данные для лучших вариантов (топ-10)
export const mockBestOptions = [
  {
    id: 1,
    address: "Мурманск, ул. Софьи Перовской, д. 25",
    location: "Мурманск, ул. Софьи Перовской, д. 25",
    type: "Квартира, 1 комната",
    price: 2800000,
    expectedReturn: 16.5,
    growth: 11.2,
    area: 28,
    floor: 4,
    totalFloors: 9,
    year: 2019,
    description: "Студия в новом доме, подходит для сдачи в аренду",
    rank: 1,
    score: 95
  },
  {
    id: 2,
    address: "Мурманск, пр-т Ленина, д. 52",
    location: "Мурманск, пр-т Ленина, д. 52",
    type: "Квартира, 1 комната",
    price: 3200000,
    expectedReturn: 15.2,
    growth: 10.5,
    area: 32,
    floor: 3,
    totalFloors: 5,
    year: 2018,
    description: "Новостройка, отличное расположение в центре",
    rank: 2,
    score: 92
  },
  {
    id: 3,
    address: "Мурманск, ул. Коминтерна, д. 8",
    location: "Мурманск, ул. Коминтерна, д. 8",
    type: "Квартира, 2 комнаты",
    price: 4200000,
    expectedReturn: 14.0,
    growth: 8.7,
    area: 42,
    floor: 2,
    totalFloors: 5,
    year: 2016,
    description: "Тихий район, рядом школа и детский сад",
    rank: 3,
    score: 89
  },
  {
    id: 4,
    address: "Мурманск, район Октябрьский",
    location: "Мурманск, район Октябрьский",
    type: "Район",
    price: 5000000,
    expectedReturn: 13.5,
    growth: 9.1,
    averagePrice: 4800000,
    propertiesCount: 45,
    description: "Перспективный район с развитой инфраструктурой",
    rank: 4,
    score: 87
  },
  {
    id: 5,
    address: "Мурманск, ул. Свердлова, д. 30",
    location: "Мурманск, ул. Свердлова, д. 30",
    type: "Квартира, 2 комнаты",
    price: 4800000,
    expectedReturn: 13.2,
    growth: 8.5,
    area: 48,
    floor: 6,
    totalFloors: 12,
    year: 2014,
    description: "Современная планировка, панорамные окна",
    rank: 5,
    score: 85
  },
  {
    id: 6,
    address: "Мурманск, ул. Ленина, д. 72",
    location: "Мурманск, ул. Ленина, д. 72",
    type: "Квартира, 2 комнаты",
    price: 4500000,
    expectedReturn: 12.5,
    growth: 8.3,
    area: 45,
    floor: 5,
    totalFloors: 9,
    year: 2015,
    description: "Удобная планировка, хорошая транспортная доступность",
    rank: 6,
    score: 83
  },
  {
    id: 7,
    address: "Мурманск, район Первомайский",
    location: "Мурманск, район Первомайский",
    type: "Район",
    price: 4500000,
    expectedReturn: 12.8,
    growth: 7.9,
    averagePrice: 4400000,
    propertiesCount: 38,
    description: "Стабильный район с хорошей транспортной доступностью",
    rank: 7,
    score: 81
  },
  {
    id: 8,
    address: "Мурманск, ул. Пушкинская, д. 15",
    location: "Мурманск, ул. Пушкинская, д. 15",
    type: "Квартира, 3 комнаты",
    price: 6800000,
    expectedReturn: 11.8,
    growth: 7.2,
    area: 68,
    floor: 7,
    totalFloors: 10,
    year: 2012,
    description: "Просторная квартира, вид на море",
    rank: 8,
    score: 79
  },
  {
    id: 9,
    address: "Мурманск, район Ленинский",
    location: "Мурманск, район Ленинский",
    type: "Район",
    price: 5200000,
    expectedReturn: 11.5,
    growth: 7.5,
    averagePrice: 5100000,
    propertiesCount: 52,
    description: "Центральный район, высокая ликвидность",
    rank: 9,
    score: 77
  },
  {
    id: 10,
    address: "Мурманск, ул. Книповича, д. 12",
    location: "Мурманск, ул. Книповича, д. 12",
    type: "Дом",
    price: 8500000,
    expectedReturn: 10.5,
    growth: 6.8,
    area: 120,
    landArea: 600,
    year: 2010,
    description: "Частный дом с участком, подходит для семьи",
    rank: 10,
    score: 75
  }
]

/**
 * Функция для получения тестовых данных по сумме инвестиций
 * @param {number} amount - Сумма инвестиций
 * @returns {Array} - Массив подходящих вариантов
 */
export function getMockInvestmentOptions(amount) {
  // Фильтруем варианты, которые подходят под сумму (с небольшим запасом ±20%)
  const minAmount = amount * 0.8
  const maxAmount = amount * 1.2
  
  return mockInvestmentOptions.filter(option => {
    return option.price >= minAmount && option.price <= maxAmount
  }).sort((a, b) => {
    // Сортируем по доходности (по убыванию)
    return b.expectedReturn - a.expectedReturn
  })
}

/**
 * Функция для получения лучших вариантов
 * @returns {Array} - Массив лучших вариантов
 */
export function getMockBestOptions() {
  return mockBestOptions
}

/**
 * Функция для получения варианта по ID
 * @param {number} id - ID варианта
 * @returns {Object|null} - Вариант или null
 */
export function getMockOptionById(id) {
  const allOptions = [...mockInvestmentOptions, ...mockBestOptions]
  return allOptions.find(option => option.id === id) || null
}


