import { useState, useEffect } from 'react'
import { getSearchHistory, clearSearchHistory, removeSearchFromHistory } from '../utils/searchHistory'
import './SearchHistory.css'

const SearchHistory = ({ onSelectSearch, onClear, refreshTrigger }) => {
  const [history, setHistory] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [refreshTrigger])

  const loadHistory = () => {
    const savedHistory = getSearchHistory()
    setHistory(savedHistory)
  }

  const handleSelect = (item) => {
    onSelectSearch(item.address, item.countRoom)
    setIsExpanded(false)
  }

  const handleClear = () => {
    if (window.confirm('Вы уверены, что хотите очистить историю поисков?')) {
      clearSearchHistory()
      setHistory([])
      if (onClear) {
        onClear()
      }
    }
  }

  const handleRemove = (e, id) => {
    e.stopPropagation()
    const updatedHistory = removeSearchFromHistory(id)
    setHistory(updatedHistory)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // Меньше минуты
      return 'только что'
    } else if (diff < 3600000) { // Меньше часа
      const minutes = Math.floor(diff / 60000)
      return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`
    } else if (diff < 86400000) { // Меньше суток
      const hours = Math.floor(diff / 3600000)
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    }
  }

  if (history.length === 0) {
    return null
  }

  return (
    <div className="search-history">
      <button
        className="search-history-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Скрыть историю' : 'Показать историю'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <span>История поисков ({history.length})</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={isExpanded ? 'expanded' : ''}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isExpanded && (
        <div className="search-history-list">
          <div className="search-history-header">
            <h3>Недавние поиски</h3>
            {history.length > 0 && (
              <button
                className="clear-history-button"
                onClick={handleClear}
                title="Очистить историю"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Очистить
              </button>
            )}
          </div>
          <div className="history-items">
            {history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleSelect(item)}
              >
                <div className="history-item-content">
                  <div className="history-item-main">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div className="history-item-info">
                      <div className="history-item-address">{item.address}</div>
                      <div className="history-item-details">
                        <span className="history-item-rooms">{item.countRoom}</span>
                        <span className="history-item-time">{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="history-item-remove"
                    onClick={(e) => handleRemove(e, item.id)}
                    title="Удалить из истории"
                    aria-label="Удалить из истории"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchHistory

