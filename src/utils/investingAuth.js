// Утилиты для работы с авторизацией в разделе инвестиций

const AUTH_CODE_KEY = 'investing_auth_code'
const AUTH_TIMESTAMP_KEY = 'investing_auth_timestamp'
const AUTH_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах

/**
 * Проверяет, авторизован ли пользователь для доступа к разделу инвестиций
 * @returns {boolean}
 */
export const isInvestingAuthorized = () => {
  try {
    const authCode = localStorage.getItem(AUTH_CODE_KEY)
    const authTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY)
    
    if (!authCode || !authTimestamp) {
      return false
    }
    
    // Проверяем, не истекла ли авторизация
    const timestamp = parseInt(authTimestamp, 10)
    const now = Date.now()
    const timeDiff = now - timestamp
    
    if (timeDiff > AUTH_EXPIRY_TIME) {
      // Авторизация истекла, очищаем
      clearInvestingAuth()
      return false
    }
    
    return true
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error)
    return false
  }
}

/**
 * Сохраняет код авторизации
 * @param {string} code - Код авторизации
 */
export const saveInvestingAuth = (code) => {
  try {
    localStorage.setItem(AUTH_CODE_KEY, code)
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error('Ошибка при сохранении авторизации:', error)
  }
}

/**
 * Очищает данные авторизации
 */
export const clearInvestingAuth = () => {
  try {
    localStorage.removeItem(AUTH_CODE_KEY)
    localStorage.removeItem(AUTH_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Ошибка при очистке авторизации:', error)
  }
}

/**
 * Получает сохраненный код авторизации
 * @returns {string|null}
 */
export const getInvestingAuthCode = () => {
  try {
    return localStorage.getItem(AUTH_CODE_KEY)
  } catch (error) {
    console.error('Ошибка при получении кода авторизации:', error)
    return null
  }
}

