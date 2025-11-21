import { useState, useEffect, useRef } from 'react'
import './CitiesAnalytics.css'

const formatPrice = (price) => {
  if (!price || price === 'no content') {
    return 'Нет данных'
  }
  return price
}

const formatPercent = (percent) => {
  if (percent === 0 || percent === null || percent === undefined) {
    return '0%'
  }
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

const formatDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return 'Нет данных'
  }
  const [year, month, day] = dateArray
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const CitiesAnalytics = ({ data, onBack, onCityClick }) => {
  const [sortField, setSortField] = useState('city')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 20
  const headerRef = useRef(null)

  // Автофокус на заголовок после загрузки данных
  useEffect(() => {
    if (data?.content && data.content.length > 0 && headerRef.current) {
      setTimeout(() => {
        headerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }, [data])

  if (!data || !data.content || data.content.length === 0) {
    return (
      <div className="cities-analytics">
        <div className="cities-analytics-header" ref={headerRef}>
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Назад</span>
          </button>
          <h2>Аналитика всех городов</h2>
        </div>
        <div className="no-data-message">
          <p>Данные не найдены</p>
        </div>
      </div>
    )
  }

  const cities = data.content

  // Сортировка городов
  const sortedCities = [...cities].sort((a, b) => {
    let aValue, bValue

    switch (sortField) {
      case 'city':
        aValue = a.city || ''
        bValue = b.city || ''
        break
      case 'price':
        // Извлекаем числовое значение из строки "5,6 млн" или "no content"
        aValue = a.price === 'no content' ? 0 : parseFloat(a.price?.replace(/[^\d,]/g, '').replace(',', '.')) || 0
        bValue = b.price === 'no content' ? 0 : parseFloat(b.price?.replace(/[^\d,]/g, '').replace(',', '.')) || 0
        break
      case 'priceMeter':
        // Извлекаем числовое значение из строки "110 598" или "no content"
        aValue = a.priceMeter === 'no content' ? 0 : parseFloat(a.priceMeter?.replace(/\s/g, '')) || 0
        bValue = b.priceMeter === 'no content' ? 0 : parseFloat(b.priceMeter?.replace(/\s/g, '')) || 0
        break
      case 'annualChange':
        aValue = a.annualPriceChangePercent || 0
        bValue = b.annualPriceChangePercent || 0
        break
      case 'threeMonthChange':
        aValue = a.threeMonthPriceChangePercent || 0
        bValue = b.threeMonthPriceChangePercent || 0
        break
      default:
        aValue = a.city || ''
        bValue = b.city || ''
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
        </svg>
      )
    }
    if (sortDirection === 'asc') {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 9l4-4 4 4"/>
        </svg>
      )
    }
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 15l4 4 4-4"/>
      </svg>
    )
  }

  const handleCityClick = (city) => {
    if (onCityClick && city.price !== 'no content') {
      onCityClick(city.city)
    }
  }

  // Пагинация
  const totalPages = Math.ceil(sortedCities.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCities = sortedCities.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Сброс страницы при изменении сортировки
  useEffect(() => {
    setCurrentPage(0)
  }, [sortField, sortDirection])

  return (
    <div className="cities-analytics">
      <div className="cities-analytics-header" ref={headerRef}>
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Назад</span>
        </button>
        <h2>Аналитика всех городов Мурманской области</h2>
        <div className="cities-header-info">
          <div className="cities-count">
            <span>Всего: {data.totalElements || cities.length}</span>
          </div>
          <div className="cities-sort-controls">
            <label>Сортировка:</label>
            <select 
              value={sortField} 
              onChange={(e) => {
                setSortField(e.target.value)
                setCurrentPage(0)
              }}
              className="sort-select"
            >
              <option value="city">По названию</option>
              <option value="price">По цене</option>
              <option value="priceMeter">По цене за м²</option>
              <option value="annualChange">По изменению за год</option>
              <option value="threeMonthChange">По изменению за 3 месяца</option>
            </select>
            <button 
              className="sort-direction-button"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              title={sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              {sortDirection === 'asc' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 9l4-4 4 4"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 15l4 4 4-4"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="cities-cards-container">
        {currentCities.map((city) => {
          const hasData = city.price !== 'no content'
          return (
            <div
              key={city.id}
              className={`city-card ${hasData ? 'clickable' : 'no-data'}`}
              onClick={() => hasData && handleCityClick(city)}
            >
              <div className="city-card-header">
                <h3 className="city-card-name">{city.city}</h3>
                {hasData && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="city-card-arrow">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
              
              {hasData ? (
                <>
                  <div className="city-card-stats">
                    <div className="city-stat">
                      <span className="city-stat-label">Цена</span>
                      <span className="city-stat-value">{formatPrice(city.price)}</span>
                    </div>
                    <div className="city-stat">
                      <span className="city-stat-label">Цена за м²</span>
                      <span className="city-stat-value">{formatPrice(city.priceMeter)}</span>
                    </div>
                  </div>
                  
                  <div className="city-card-changes">
                    <div className={`city-change-item ${city.annualPriceChangePercent > 0 ? 'positive' : city.annualPriceChangePercent < 0 ? 'negative' : ''}`}>
                      <span className="change-label">За год</span>
                      <span className="change-value">{formatPercent(city.annualPriceChangePercent)}</span>
                    </div>
                    <div className={`city-change-item ${city.threeMonthPriceChangePercent > 0 ? 'positive' : city.threeMonthPriceChangePercent < 0 ? 'negative' : ''}`}>
                      <span className="change-label">За 3 месяца</span>
                      <span className="change-value">{formatPercent(city.threeMonthPriceChangePercent)}</span>
                    </div>
                  </div>
                  
                  <div className="city-card-footer">
                    <span className="city-date">Обновлено: {formatDate(city.created)}</span>
                  </div>
                </>
              ) : (
                <div className="city-card-no-data">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Нет данных</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="cities-pagination">
          <button 
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Назад</span>
          </button>
          <div className="pagination-info">
            <span>Страница {currentPage + 1} из {totalPages}</span>
            <span className="pagination-items-info">
              Показано {startIndex + 1}-{Math.min(endIndex, sortedCities.length)} из {sortedCities.length}
            </span>
          </div>
          <button 
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <span>Вперед</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default CitiesAnalytics

