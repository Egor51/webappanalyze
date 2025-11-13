const HISTORY_KEY = 'murmanclick_search_history'
const MAX_HISTORY_ITEMS = 10

export const saveSearchToHistory = (address, countRoom) => {
  try {
    const history = getSearchHistory()
    
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
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    return newHistory
  } catch (error) {
    console.error('Ошибка при сохранении истории поиска:', error)
    return []
  }
}

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('Ошибка при получении истории поиска:', error)
    return []
  }
}

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY)
    return []
  } catch (error) {
    console.error('Ошибка при очистке истории поиска:', error)
    return []
  }
}

export const removeSearchFromHistory = (id) => {
  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory))
    return filteredHistory
  } catch (error) {
    console.error('Ошибка при удалении из истории поиска:', error)
    return getSearchHistory()
  }
}

