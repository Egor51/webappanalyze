/**
 * Политика логирования для MurmanClick
 * Безопасное логирование без чувствительных данных
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  level?: LogLevel
  context?: string
  sanitize?: boolean
}

/**
 * Санитизация данных для безопасного логирования
 * Удаляет чувствительные поля
 */
const sanitizeData = (data: unknown): unknown => {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'firstName',
    'lastName',
    'address',
    'telegramId',
    'phone',
    'email',
  ]

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized = { ...data } as Record<string, unknown>

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  // Рекурсивно санитизируем вложенные объекты
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Безопасный логгер
 * Логирует только в dev режиме и санитизирует чувствительные данные
 */
export const logger = {
  debug: (message: string, data?: unknown, options?: LogOptions) => {
    if (!import.meta.env.DEV) {
return
}

    const sanitizedData = options?.sanitize !== false ? sanitizeData(data) : data
    const context = options?.context ? `[${options.context}]` : ''

    console.debug(`${context} ${message}`, sanitizedData)
  },

  info: (message: string, data?: unknown, options?: LogOptions) => {
    if (!import.meta.env.DEV) {
return
}

    const sanitizedData = options?.sanitize !== false ? sanitizeData(data) : data
    const context = options?.context ? `[${options.context}]` : ''

    console.info(`${context} ${message}`, sanitizedData)
  },

  warn: (message: string, data?: unknown, options?: LogOptions) => {
    const sanitizedData = options?.sanitize !== false ? sanitizeData(data) : data
    const context = options?.context ? `[${options.context}]` : ''

    console.warn(`${context} ${message}`, sanitizedData)
  },

  error: (message: string, error?: unknown, options?: LogOptions) => {
    const sanitizedData = options?.sanitize !== false ? sanitizeData(error) : error
    const context = options?.context ? `[${options.context}]` : ''

    console.error(`${context} ${message}`, sanitizedData)
  },
}

/**
 * Логирование ошибок API с санитизацией
 */
export const logApiError = (endpoint: string, error: unknown) => {
  // Извлекаем только безопасную информацию об ошибке
  const safeError = error instanceof Error
    ? {
        message: error.message,
        name: error.name,
        // НЕ логируем stack trace в продакшене
        stack: import.meta.env.DEV ? error.stack : undefined,
      }
    : { message: String(error) }

  logger.error(`API Error: ${endpoint}`, safeError, {
    context: 'API',
    sanitize: true,
  })
}

/**
 * Логирование событий аналитики (без чувствительных данных)
 */
export const logAnalyticsEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!import.meta.env.DEV) {
return
}

  const sanitizedParams = sanitizeData(params) as Record<string, unknown>
  logger.info(`Analytics: ${eventName}`, sanitizedParams, {
    context: 'Analytics',
    sanitize: true,
  })
}

