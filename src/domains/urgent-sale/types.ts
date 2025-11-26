/**
 * Urgent Sale domain types
 * Типы для домена срочной продажи
 */

/**
 * Данные формы заявки на срочную продажу
 */
export interface UrgentSaleFormData {
  name: string
  phone: string
  city: string
  objectType: string
  description: string
}

/**
 * Ответ сервера на отправку заявки
 */
export interface UrgentSaleFormResponse {
  success: boolean
  message?: string
  id?: string | number
}

