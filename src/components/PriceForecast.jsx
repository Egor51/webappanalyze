import './PriceForecast.css'

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

const PriceForecast = ({ forecastData, analytics, address }) => {
  if (!forecastData || !forecastData.forecast) {
    return null
  }
  
  if (!analytics || analytics.length < 3) {
    return null
  }

  const forecast = forecastData.forecast
  const lastPrice = analytics[analytics.length - 1].avgPrice

  // Вычисляем изменения
  const change3 = forecast.month3 ? ((forecast.month3 - lastPrice) / lastPrice) * 100 : null
  const change6 = forecast.month6 ? ((forecast.month6 - lastPrice) / lastPrice) * 100 : null
  const change12 = forecast.month12 ? ((forecast.month12 - lastPrice) / lastPrice) * 100 : null
  

  return (
    <div className="forecast-section">
      <div className="forecast-header-section">
        <div className="forecast-header-left">
          <div className="forecast-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20"></path>
              <path d="M12 6v12M6 12h12"></path>
            </svg>
          </div>
          <h4 className="forecast-title">Прогноз цены (ML)</h4>
        </div>
      </div>

      <div className="forecast-summary">
        {forecast.month3 && (
          <div className="forecast-stat">
            <div className="forecast-stat-label">3 месяца</div>
            <div className="forecast-stat-value">{formatPrice(forecast.month3)}</div>
            {change3 !== null && (
              <div className={`forecast-change ${change3 >= 0 ? 'positive' : 'negative'}`}>
                {change3 >= 0 ? '+' : ''}{change3.toFixed(1)}%
              </div>
            )}
          </div>
        )}
        {forecast.month6 && (
          <div className="forecast-stat">
            <div className="forecast-stat-label">6 месяцев</div>
            <div className="forecast-stat-value">{formatPrice(forecast.month6)}</div>
            {change6 !== null && (
              <div className={`forecast-change ${change6 >= 0 ? 'positive' : 'negative'}`}>
                {change6 >= 0 ? '+' : ''}{change6.toFixed(1)}%
              </div>
            )}
          </div>
        )}
        {forecast.month12 && (
          <div className="forecast-stat">
            <div className="forecast-stat-label">12 месяцев</div>
            <div className="forecast-stat-value">{formatPrice(forecast.month12)}</div>
            {change12 !== null && (
              <div className={`forecast-change ${change12 >= 0 ? 'positive' : 'negative'}`}>
                {change12 >= 0 ? '+' : ''}{change12.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>

      {forecastData.reasoning && (
        <div className="forecast-reasoning">
          <div className="forecast-reasoning-label">Обоснование прогноза:</div>
          <div className="forecast-reasoning-text">{forecastData.reasoning}</div>
        </div>
      )}

      <div className="forecast-disclaimer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>
        
          Прогноз сгенерирован с использованием ML модели на основе исторических данных. 
          Результаты носят информационный характер и могут не учитывать все внешние факторы.
        </span>
      </div>
    </div>
  )
}

export default PriceForecast

