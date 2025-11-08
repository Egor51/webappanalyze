import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Results.css'

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
}

const Results = ({ data }) => {
  const result = data?.[0]

  const chartData = useMemo(() => {
    if (!result?.analytics) return []
    return result.analytics.map((item) => ({
      date: formatDate(item.date),
      price: item.avgPrice,
      fullDate: item.date,
    }))
  }, [result])

  if (!result) {
    return (
      <div className="results-empty">
        <p>Данные не найдены</p>
      </div>
    )
  }

  const priceChangeColor = result.annualPriceChangePercent >= 0 ? 'var(--success)' : 'var(--error)'
  const threeMonthChangeColor = result.threeMonthPriceChangePercent >= 0 ? 'var(--success)' : 'var(--error)'

  return (
    <div className="results">
      <div className="results-header">
        <h2>Результаты оценки</h2>
      </div>

      <div className="result-card address-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div className="card-content">
          <p className="address-text">{result.address}</p>
        </div>
      </div>

      <div className="result-card price-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div className="card-content">
          <div className="price-main">
            <span className="price-label">Средняя цена</span>
            <span className="price-value">{result.price}</span>
          </div>
          <div className="price-details">
            <div className="price-item">
              <span className="price-item-label">За м²</span>
              <span className="price-item-value">{result.priceMeter} ₽</span>
            </div>
            <div className="price-range">
              <div className="price-item">
                <span className="price-item-label">Мин</span>
                <span className="price-item-value">{result.priceMin}</span>
              </div>
              <div className="price-item">
                <span className="price-item-label">Макс</span>
                <span className="price-item-value">{result.priceMax}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="result-card chart-card">
          <div className="card-header">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 6 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 6 22 6 22 12"></polyline>
              </svg>
            </div>
            <h3>Динамика изменения цены</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value) => formatPrice(value)}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--accent)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="result-card stats-card">
        <div className="card-header">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <h3>Изменение цены</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">За год</span>
            <span 
              className="stat-value" 
              style={{ color: priceChangeColor }}
            >
              {result.annualPriceChangePercent > 0 ? '+' : ''}
              {result.annualPriceChangePercent.toFixed(2)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">За 3 месяца</span>
            <span 
              className="stat-value" 
              style={{ color: threeMonthChangeColor }}
            >
              {result.threeMonthPriceChangePercent > 0 ? '+' : ''}
              {result.threeMonthPriceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results

