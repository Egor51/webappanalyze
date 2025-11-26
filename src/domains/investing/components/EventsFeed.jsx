import { useState, useEffect } from 'react'
import { buildApiUrl, API_CONFIG } from '../../config/api'
import './EventsFeed.css'

const EVENT_TYPES = {
  PRICE_DROP: 'price_drop',
  PRICE_INCREASE: 'price_increase',
  NEW_MATCH: 'new_match',
  LONG_LISTING: 'long_listing',
  VOLUME_SPIKE: 'volume_spike',
  PATTERN: 'pattern'
}

const getEventIcon = (type) => {
  const icons = {
    [EVENT_TYPES.PRICE_DROP]: '🔻',
    [EVENT_TYPES.PRICE_INCREASE]: '📈',
    [EVENT_TYPES.NEW_MATCH]: '🔥',
    [EVENT_TYPES.LONG_LISTING]: '🧊',
    [EVENT_TYPES.VOLUME_SPIKE]: '⚡',
    [EVENT_TYPES.PATTERN]: '💡'
  }
  return icons[type] || '📌'
}

const getEventColor = (type, priority) => {
  if (priority === 'high') {
return 'var(--error)'
}
  if (priority === 'medium') {
return 'var(--warning)'
}
  
  const colors = {
    [EVENT_TYPES.PRICE_DROP]: '#10b981',
    [EVENT_TYPES.PRICE_INCREASE]: '#ef4444',
    [EVENT_TYPES.NEW_MATCH]: '#3b82f6',
    [EVENT_TYPES.LONG_LISTING]: '#64748b',
    [EVENT_TYPES.VOLUME_SPIKE]: '#f59e0b',
    [EVENT_TYPES.PATTERN]: '#8b5cf6'
  }
  return colors[type] || 'var(--text-secondary)'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
return 'только что'
}
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
  }
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const EventsFeed = ({ isPro = false, mandates = [] }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'price', 'match', 'listing', 'volume', 'pattern'

  useEffect(() => {
    loadEvents()
    // Автообновление каждые 30 секунд для PRO, каждые 60 секунд для FREE
    const interval = setInterval(loadEvents, isPro ? 30000 : 60000)
    return () => clearInterval(interval)
  }, [isPro, mandates])

  const loadEvents = async () => {
    try {
      // TODO: Заменить на реальный API endpoint когда будет готов
      // const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.INVEST_EVENTS)
      // const response = await fetch(apiUrl, {...})
      
      // Временные моковые данные для демонстрации
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockEvents = generateMockEvents()
      
      // Фильтруем по мандатам, если не PRO
      const filteredEvents = isPro 
        ? mockEvents 
        : mockEvents.filter(e => e.priority === 'high').slice(0, 5)
      
      setEvents(filteredEvents)
      setError(null)
    } catch (err) {
      console.error('Ошибка загрузки событий:', err)
      setError('Не удалось загрузить события')
    } finally {
      setLoading(false)
    }
  }

  const generateMockEvents = () => {
    const now = Date.now()
    return [
      {
        id: '1',
        type: EVENT_TYPES.PRICE_DROP,
        title: 'Цена снижена на 300 000 ₽',
        description: 'По объекту в Ленинском районе, Мурманск',
        objectId: 'obj1',
        timestamp: now - 300000,
        priority: 'high',
        amount: 300000
      },
      {
        id: '2',
        type: EVENT_TYPES.NEW_MATCH,
        title: 'Новый объект ниже рынка на 18%',
        description: 'Под вашу стратегию ФЛИП в Октябрьском районе',
        objectId: 'obj2',
        timestamp: now - 1800000,
        priority: 'high',
        mandateId: mandates[0]?.id
      },
      {
        id: '3',
        type: EVENT_TYPES.LONG_LISTING,
        title: 'Квартира 2к в Октябрьском — висит 90 дней',
        description: 'Торг возможен, объект выше рынка на 12%',
        objectId: 'obj3',
        timestamp: now - 3600000,
        priority: 'medium',
        daysOnMarket: 90
      },
      {
        id: '4',
        type: EVENT_TYPES.VOLUME_SPIKE,
        title: 'Всплеск сделок в Ленинском районе',
        description: 'За последний месяц +15% к среднему',
        objectId: null,
        timestamp: now - 7200000,
        priority: 'medium',
        district: 'Ленинский'
      },
      {
        id: '5',
        type: EVENT_TYPES.PATTERN,
        title: 'Обнаружен успешный паттерн',
        description: 'Объект похож на прошлые прибыльные сделки',
        objectId: 'obj4',
        timestamp: now - 10800000,
        priority: 'low'
      },
      {
        id: '6',
        type: EVENT_TYPES.PRICE_INCREASE,
        title: 'Цена выросла на 150 000 ₽',
        description: 'По объекту в Первомайском районе',
        objectId: 'obj5',
        timestamp: now - 14400000,
        priority: 'low',
        amount: 150000
      }
    ]
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => {
        if (filter === 'price') {
return e.type === EVENT_TYPES.PRICE_DROP || e.type === EVENT_TYPES.PRICE_INCREASE
}
        if (filter === 'match') {
return e.type === EVENT_TYPES.NEW_MATCH
}
        if (filter === 'listing') {
return e.type === EVENT_TYPES.LONG_LISTING
}
        if (filter === 'volume') {
return e.type === EVENT_TYPES.VOLUME_SPIKE
}
        if (filter === 'pattern') {
return e.type === EVENT_TYPES.PATTERN
}
        return true
      })

  const handleEventClick = (event) => {
    if (event.objectId) {
      // TODO: Переход к объекту
      console.log('Переход к объекту:', event.objectId)
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="events-feed">
        <div className="events-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка событий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="events-feed">
      <div className="events-feed-header">
        <div>
          <h3>События рынка</h3>
          <p className="events-subtitle">
            Сигналы и изменения на рынке недвижимости в реальном времени
          </p>
        </div>
        {!isPro && (
          <div className="events-pro-badge">
            <span>PRO</span>
          </div>
        )}
      </div>

      {!isPro && (
        <div className="events-pro-banner">
          <p>Вы видите ограниченный набор событий. Оформите PRO для полного доступа к ленте событий без задержки.</p>
          <button className="events-pro-button">Оформить PRO</button>
        </div>
      )}

      <div className="events-filters">
        <button
          className={`events-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button
          className={`events-filter ${filter === 'price' ? 'active' : ''}`}
          onClick={() => setFilter('price')}
        >
          Цены
        </button>
        <button
          className={`events-filter ${filter === 'match' ? 'active' : ''}`}
          onClick={() => setFilter('match')}
        >
          Совпадения
        </button>
        <button
          className={`events-filter ${filter === 'listing' ? 'active' : ''}`}
          onClick={() => setFilter('listing')}
        >
          Долгие объявления
        </button>
        {isPro && (
          <>
            <button
              className={`events-filter ${filter === 'volume' ? 'active' : ''}`}
              onClick={() => setFilter('volume')}
            >
              Объемы
            </button>
            <button
              className={`events-filter ${filter === 'pattern' ? 'active' : ''}`}
              onClick={() => setFilter('pattern')}
            >
              Паттерны
            </button>
          </>
        )}
      </div>

      {error ? (
        <div className="events-error">
          <p>{error}</p>
          <button onClick={loadEvents}>Попробовать снова</button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="events-empty">
          <p>Нет событий по выбранному фильтру</p>
        </div>
      ) : (
        <div className="events-list">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className={`event-item event-${event.priority}`}
              onClick={() => handleEventClick(event)}
            >
              <div className="event-icon" style={{ color: getEventColor(event.type, event.priority) }}>
                {getEventIcon(event.type)}
              </div>
              <div className="event-content">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  <span className="event-time">{formatTime(event.timestamp)}</span>
                </div>
                <p className="event-description">{event.description}</p>
                {event.amount && (
                  <div className="event-meta">
                    <span className="event-amount">{event.amount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
              </div>
              {event.priority === 'high' && (
                <div className="event-priority-badge">!</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsFeed

