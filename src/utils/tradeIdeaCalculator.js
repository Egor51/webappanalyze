/**
 * Утилиты для расчета потенциала инвестиционных идей
 */

/**
 * Рассчитывает потенциал объекта для стратегии "Флип"
 * @param {Object} option - Объект инвестиции
 * @param {Object} analyticsResponse - Данные аналитики
 * @returns {Object} Потенциал флипа
 */
export const calculateFlipPotential = (option, analyticsResponse) => {
  if (!option.price || !analyticsResponse) {
    return null
  }

  const currentPrice = typeof option.price === 'number' ? option.price : parseFloat(option.price.replace(/[^\d.]/g, '')) * 1000000
  const marketPrice = analyticsResponse.priceAvg || currentPrice
  
  // Если объект дешевле рынка, считаем потенциал
  const marketDifference = option.differencePercent || 0
  const potentialDiscount = marketDifference < 0 ? Math.abs(marketDifference) : 0
  
  // Оценка маржи после ремонта (примерно 15-25% от цены)
  const renovationCost = currentPrice * 0.15 // 15% на ремонт
  const totalInvestment = currentPrice + renovationCost
  const estimatedSalePrice = marketPrice * 1.1 // +10% после ремонта
  const flipMargin = estimatedSalePrice - totalInvestment
  const flipMarginPercent = (flipMargin / totalInvestment) * 100

  return {
    marketDifference,
    potentialDiscount,
    renovationCost,
    totalInvestment,
    estimatedSalePrice,
    flipMargin,
    flipMarginPercent,
    isProfitable: flipMargin > 0
  }
}

/**
 * Рассчитывает потенциал объекта для стратегии "Аренда"
 * @param {Object} option - Объект инвестиции
 * @param {Object} analyticsResponse - Данные аналитики
 * @returns {Object} Потенциал аренды
 */
export const calculateRentalPotential = (option, analyticsResponse) => {
  if (!option.price || !option.square) {
    return null
  }

  const currentPrice = typeof option.price === 'number' ? option.price : parseFloat(option.price.replace(/[^\d.]/g, '')) * 1000000
  const square = option.square
  
  // Оценка арендной платы (примерно 0.5-0.8% от стоимости в месяц)
  const monthlyRent = currentPrice * 0.006 // 0.6% в месяц
  const annualRent = monthlyRent * 12
  const rentalYield = (annualRent / currentPrice) * 100
  
  // Оценка окупаемости
  const paybackYears = currentPrice / annualRent

  return {
    monthlyRent,
    annualRent,
    rentalYield,
    paybackYears,
    pricePerSquare: currentPrice / square,
    rentPerSquare: monthlyRent / square
  }
}

/**
 * Определяет уровень интереса (1-5 звезд)
 * @param {Object} option - Объект инвестиции
 * @param {Object} flipPotential - Потенциал флипа
 * @param {Object} rentalPotential - Потенциал аренды
 * @returns {number} Уровень интереса от 1 до 5
 */
export const calculateInterestLevel = (option, flipPotential, rentalPotential) => {
  let score = 0

  // Разница с рынком (максимум 2 балла)
  if (option.differencePercent) {
    if (option.differencePercent < -20) score += 2
    else if (option.differencePercent < -10) score += 1.5
    else if (option.differencePercent < -5) score += 1
    else if (option.differencePercent > 10) score -= 1
  }

  // Потенциал флипа (максимум 2 балла)
  if (flipPotential && flipPotential.isProfitable) {
    if (flipPotential.flipMarginPercent > 30) score += 2
    else if (flipPotential.flipMarginPercent > 20) score += 1.5
    else if (flipPotential.flipMarginPercent > 10) score += 1
  }

  // Потенциал аренды (максимум 1 балл)
  if (rentalPotential) {
    if (rentalPotential.rentalYield > 12) score += 1
    else if (rentalPotential.rentalYield > 8) score += 0.5
  }

  // Нормализуем до 1-5
  const level = Math.max(1, Math.min(5, Math.round(score + 2)))
  return level
}

/**
 * Определяет риски объекта
 * @param {Object} option - Объект инвестиции
 * @param {Object} analyticsResponse - Данные аналитики
 * @returns {Array} Массив рисков
 */
export const identifyRisks = (option, analyticsResponse) => {
  const risks = []

  // Риск: объект дороже рынка
  if (option.differencePercent && option.differencePercent > 10) {
    risks.push({
      type: 'overpriced',
      severity: 'high',
      message: 'Объект дороже рынка на ' + option.differencePercent.toFixed(1) + '%'
    })
  }

  // Риск: низкая ликвидность (если есть данные о времени на рынке)
  if (option.daysOnMarket && option.daysOnMarket > 90) {
    risks.push({
      type: 'low_liquidity',
      severity: 'medium',
      message: 'Объект на рынке более 90 дней'
    })
  }

  // Риск: отрицательная динамика цен
  if (analyticsResponse && analyticsResponse.threeMonthPriceChangePercent) {
    if (analyticsResponse.threeMonthPriceChangePercent < -5) {
      risks.push({
        type: 'price_decline',
        severity: 'medium',
        message: 'Снижение цены за 3 месяца на ' + Math.abs(analyticsResponse.threeMonthPriceChangePercent).toFixed(1) + '%'
      })
    }
  }

  // Риск: старый дом (если адрес содержит указание на старый район)
  const address = (option.fullAddress || '').toLowerCase()
  if (address.includes('старый') || address.includes('ветхий')) {
    risks.push({
      type: 'old_building',
      severity: 'low',
      message: 'Возможен старый дом'
    })
  }

  return risks
}

/**
 * Формирует полный объект Trade Idea
 * @param {Object} option - Исходный объект инвестиции
 * @param {Object} mandate - Мандат (опционально)
 * @returns {Object} Объект Trade Idea с потенциалом
 */
export const createTradeIdea = (option, mandate = null) => {
  const analyticsResponse = option.analyticsResponse || {}
  
  // Определяем стратегию из мандата или по умолчанию
  const strategy = mandate?.strategy || 'rent'
  
  const flipPotential = calculateFlipPotential(option, analyticsResponse)
  const rentalPotential = calculateRentalPotential(option, analyticsResponse)
  const interestLevel = calculateInterestLevel(option, flipPotential, rentalPotential)
  const risks = identifyRisks(option, analyticsResponse)

  return {
    ...option,
    potential: {
      marketDifference: option.differencePercent || 0,
      flipMargin: flipPotential?.flipMargin || null,
      flipMarginPercent: flipPotential?.flipMarginPercent || null,
      rentalYield: rentalPotential?.rentalYield || null,
      monthlyRent: rentalPotential?.monthlyRent || null,
      interestLevel,
      strategy
    },
    risks,
    matchesMandate: mandate ? true : false
  }
}

