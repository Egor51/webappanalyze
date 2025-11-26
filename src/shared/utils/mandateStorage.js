// Утилиты для работы с мандатами инвестора

const MANDATES_KEY = 'investing_mandates'
const MAX_FREE_MANDATES = 1
const MAX_PRO_MANDATES = 5

/**
 * Получает все мандаты из localStorage
 * @returns {Array}
 */
export const getMandates = () => {
  try {
    const mandates = localStorage.getItem(MANDATES_KEY)
    return mandates ? JSON.parse(mandates) : []
  } catch (error) {
    console.error('Ошибка при получении мандатов:', error)
    return []
  }
}

/**
 * Сохраняет мандат
 * @param {Object} mandate - Объект мандата
 * @param {boolean} isPro - Является ли пользователь PRO
 * @returns {Object} Результат сохранения
 */
export const saveMandate = (mandate, isPro = false) => {
  try {
    const mandates = getMandates()
    const maxMandates = isPro ? MAX_PRO_MANDATES : MAX_FREE_MANDATES
    
    // Проверяем лимит
    if (mandates.length >= maxMandates && !mandates.find(m => m.id === mandate.id)) {
      return {
        success: false,
        error: isPro 
          ? `Максимум ${MAX_PRO_MANDATES} мандатов для PRO`
          : `Максимум ${MAX_FREE_MANDATES} мандат для бесплатного аккаунта. Оформите PRO для большего количества.`
      }
    }

    // Обновляем существующий или добавляем новый
    const existingIndex = mandates.findIndex(m => m.id === mandate.id)
    if (existingIndex >= 0) {
      mandates[existingIndex] = mandate
    } else {
      mandates.push(mandate)
    }

    localStorage.setItem(MANDATES_KEY, JSON.stringify(mandates))
    return { success: true, mandates }
  } catch (error) {
    console.error('Ошибка при сохранении мандата:', error)
    return { success: false, error: 'Ошибка при сохранении мандата' }
  }
}

/**
 * Удаляет мандат
 * @param {string} mandateId - ID мандата
 * @returns {boolean}
 */
export const deleteMandate = (mandateId) => {
  try {
    const mandates = getMandates()
    const filtered = mandates.filter(m => m.id !== mandateId)
    localStorage.setItem(MANDATES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Ошибка при удалении мандата:', error)
    return false
  }
}

/**
 * Проверяет, соответствует ли объект мандату
 * @param {Object} option - Объект инвестиции
 * @param {Object} mandate - Мандат
 * @returns {boolean}
 */
export const matchesMandate = (option, mandate) => {
  // Проверка бюджета
  if (option.price) {
    if (mandate.budgetMin && option.price < mandate.budgetMin) {
return false
}
    if (mandate.budgetMax && option.price > mandate.budgetMax) {
return false
}
  }

  // Проверка города
  if (mandate.cities.length > 0 && option.fullAddress) {
    const matchesCity = mandate.cities.some(city => 
      option.fullAddress.toLowerCase().includes(city.toLowerCase())
    )
    if (!matchesCity) {
return false
}
  }

  // Проверка района (если указан Мурманск)
  if (mandate.districts.length > 0 && option.fullAddress) {
    const matchesDistrict = mandate.districts.some(district => 
      option.fullAddress.toLowerCase().includes(district.toLowerCase())
    )
    if (!matchesDistrict) {
return false
}
  }

  // TODO: Проверка типа объекта, риска и других параметров

  return true
}

/**
 * Получает количество найденных объектов для мандата
 * @param {string} mandateId - ID мандата
 * @returns {number}
 */
export const getMandateMatchCount = (mandateId) => {
  try {
    const count = localStorage.getItem(`mandate_${mandateId}_count`)
    return count ? parseInt(count, 10) : 0
  } catch (error) {
    return 0
  }
}

/**
 * Сохраняет количество найденных объектов для мандата
 * @param {string} mandateId - ID мандата
 * @param {number} count - Количество
 */
export const setMandateMatchCount = (mandateId, count) => {
  try {
    localStorage.setItem(`mandate_${mandateId}_count`, count.toString())
  } catch (error) {
    console.error('Ошибка при сохранении количества совпадений:', error)
  }
}

