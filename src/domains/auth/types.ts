/**
 * Auth domain types
 * Типы для домена аутентификации
 */

/**
 * Данные пользователя Telegram
 */
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

/**
 * Статус авторизации для инвестиций
 */
export interface InvestingAuthStatus {
  isAuthorized: boolean
  isPro?: boolean
  userId?: string | number
}

