/**
 * Асинхронная работа с localStorage
 * Предотвращает блокировку главного потока
 */

/**
 * Асинхронное чтение из localStorage
 */
export const getItemAsync = async <T>(key: string, defaultValue: T | null = null): Promise<T | null> => {
  return new Promise((resolve) => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        resolve(defaultValue)
        return
      }
      const parsed = JSON.parse(item) as T
      resolve(parsed)
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      resolve(defaultValue)
    }
  })
}

/**
 * Асинхронная запись в localStorage
 */
export const setItemAsync = async (key: string, value: unknown): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      resolve(true)
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      resolve(false)
    }
  })
}

/**
 * Асинхронное удаление из localStorage
 */
export const removeItemAsync = async (key: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      localStorage.removeItem(key)
      resolve(true)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      resolve(false)
    }
  })
}

/**
 * Debounced запись в localStorage
 * Полезно для частых обновлений (например, история поиска)
 */
export const createDebouncedStorage = (key: string, delay: number = 300) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingValue: unknown = null

  const flush = async () => {
    if (pendingValue !== null && timeoutId !== null) {
      await setItemAsync(key, pendingValue)
      pendingValue = null
      timeoutId = null
    }
  }

  const set = async (value: unknown) => {
    pendingValue = value
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      flush()
    }, delay)
  }

  return { set, flush }
}

