import './AllCitiesBlock.css'

const AllCitiesBlock = ({ onGetAllCities, searchType }) => {
  if (searchType !== 'city') {
    return null
  }

  return (
    <div className="all-cities-block">
      <div className="all-cities-content">
        <div className="all-cities-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18"></path>
            <path d="M5 21V7l8-4v18"></path>
            <path d="M19 21V11l-6-4"></path>
            <line x1="9" y1="9" x2="9" y2="9"></line>
            <line x1="9" y1="12" x2="9" y2="12"></line>
            <line x1="9" y1="15" x2="9" y2="15"></line>
            <line x1="9" y1="18" x2="9" y2="18"></line>
          </svg>
        </div>
        <div className="all-cities-text">
          <h3 className="all-cities-title">Аналитика всех городов</h3>
          <p className="all-cities-description">
            Получите полную аналитику по всем городам Мурманской области: цены, динамика изменений, 
            сравнение показателей. Кликните на любой город для детального анализа.
          </p>
        </div>
        <button
          type="button"
          className="get-all-cities-button"
          onClick={onGetAllCities}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18"></path>
            <path d="M5 21V7l8-4v18"></path>
            <path d="M19 21V11l-6-4"></path>
            <line x1="9" y1="9" x2="9" y2="9"></line>
            <line x1="9" y1="12" x2="9" y2="12"></line>
            <line x1="9" y1="15" x2="9" y2="15"></line>
            <line x1="9" y1="18" x2="9" y2="18"></line>
          </svg>
          <span>Получить аналитику всех городов</span>
        </button>
      </div>
    </div>
  )
}

export default AllCitiesBlock

