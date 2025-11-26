import { createDebouncedStorage } from './asyncStorage'

const HISTORY_KEY = 'murmanclick_search_history'
const MAX_HISTORY_ITEMS = 10

// Debounced storage для оптимизации частых записей
const debouncedStorage = createDebouncedStorage(HISTORY_KEY, 300)

export const saveSearchToHistory = async (address, countRoom) => {
  try {
    const history = await getSearchHistory()
    
    // Удаляем дубликаты (если такой поиск уже есть)
    const filteredHistory = history.filter(
      item => !(item.address === address && item.countRoom === countRoom)
    )
    
    // Добавляем новый поиск в начало
    const newHistory = [
      {
        address,
        countRoom,
        timestamp: Date.now(),
        id: Date.now().toString()
      },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS) // Ограничиваем количество
    
    // Используем debounced запись для оптимизации
    await debouncedStorage.set(newHistory)
    return newHistory
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Ошибка при сохранении истории поиска:', error)
    }
    return []
  }
}

export const getSearchHistory = async () => {
  try {
    const { getItemAsync } = await import('./asyncStorage')
    return await getItemAsync(HISTORY_KEY, [])
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Ошибка при получении истории поиска:', error)
    }
    // Fallback на синхронное чтение
    try {
      const history = localStorage.getItem(HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch {
      return []
    }
  }
}

export const clearSearchHistory = async () => {
  try {
    const { removeItemAsync } = await import('./asyncStorage')
    await removeItemAsync(HISTORY_KEY)
    return []
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Ошибка при очистке истории поиска:', error)
    }
    // Fallback на синхронное удаление
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // Игнорируем ошибки при удалении
    }
    return []
  }
}

export const removeSearchFromHistory = async (id) => {
  try {
    const history = await getSearchHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    const { setItemAsync } = await import('./asyncStorage')
    await setItemAsync(HISTORY_KEY, filteredHistory)
    return filteredHistory
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Ошибка при удалении из истории поиска:', error)
    }
    return await getSearchHistory()
  }
}

