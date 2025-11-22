import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Investing.css'

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
}

const InvestmentDetailView = ({ option, onBack }) => {
  // Подготовка данных для графика
  const chartData = useMemo(() => {
    if (!option || !option.analyticsResponse || !option.analyticsResponse.analytics || !Array.isArray(option.analyticsResponse.analytics)) {
      return []
    }
    return option.analyticsResponse.analytics.map(item => ({
      date: item.date,
      price: item.avgPrice
    }))
  }, [option])

  // Вычисление диапазона для оси Y
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto']
    const prices = chartData.map(d => d.price).filter(price => typeof price === 'number' && !isNaN(price))
    if (prices.length === 0) return ['auto', 'auto']
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice
    const padding = range * 0.1
    return [Math.max(0, minPrice - padding), maxPrice + padding]
  }, [chartData])

  if (!option) return null

  return (
    <div className="investment-detail-view">
      <button className="back-from-detail-button" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"></path>
        </svg>
        <span>Назад к списку</span>
      </button>
      
      <div className="detail-card">
        {/* Основная информация об объекте */}
        <div className="detail-header">
          <h3 className="detail-address">{option.fullAddress}</h3>
          <div className="detail-basic-info">
            <div className="detail-info-item">
              <span className="detail-info-label">Площадь</span>
              <span className="detail-info-value">{option.square} м²</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">Комнат</span>
              <span className="detail-info-value">{option.countRoom || 'Не указано'}</span>
            </div>
            <div className="detail-info-item highlight">
              <span className="detail-info-label">Цена</span>
              <span className="detail-info-value price">{formatPrice(option.price)}</span>
            </div>
          </div>
        </div>

        {/* Блок аналитики */}
        {(option.analyticsResponse || option.differencePercent != null) && (
          <div className="detail-analytics">
            <h4 className="analytics-title">Аналитика цен</h4>
            <div className="analytics-grid">
              {option.differencePercent != null && (
                <div className="analytics-item highlight">
                  <span className="analytics-label">
                    {option.differencePercent < 0 ? 'Дешевле рынка' : 'Дороже рынка'}
                  </span>
                  <span className={`analytics-value ${option.differencePercent < 0 ? 'positive' : 'negative'}`}>
                    {option.differencePercent >= 0 ? '+' : ''}
                    {option.differencePercent.toFixed(1)}%
                  </span>
                </div>
              )}
              {option.analyticsResponse?.price && (
                <div className="analytics-item">
                  <span className="analytics-label">Средняя цена</span>
                  <span className="analytics-value">{option.analyticsResponse.price}</span>
                </div>
              )}
              {option.analyticsResponse?.priceMeter && (
                <div className="analytics-item">
                  <span className="analytics-label">Цена за м²</span>
                  <span className="analytics-value">{option.analyticsResponse.priceMeter} ₽</span>
                </div>
              )}
              {option.analyticsResponse?.priceMin && (
                <div className="analytics-item">
                  <span className="analytics-label">Минимальная цена</span>
                  <span className="analytics-value">{option.analyticsResponse.priceMin}</span>
                </div>
              )}
              {option.analyticsResponse?.priceMax && (
                <div className="analytics-item">
                  <span className="analytics-label">Максимальная цена</span>
                  <span className="analytics-value">{option.analyticsResponse.priceMax}</span>
                </div>
              )}
              {option.analyticsResponse?.annualPriceChangePercent != null && (
                <div className="analytics-item highlight">
                  <span className="analytics-label">Рост за год</span>
                  <span className={`analytics-value ${option.analyticsResponse.annualPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                    {option.analyticsResponse.annualPriceChangePercent >= 0 ? '+' : ''}
                    {option.analyticsResponse.annualPriceChangePercent.toFixed(2)}%
                  </span>
                </div>
              )}
              {option.analyticsResponse?.threeMonthPriceChangePercent != null && (
                <div className="analytics-item">
                  <span className="analytics-label">Рост за 3 месяца</span>
                  <span className={`analytics-value ${option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                    {option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? '+' : ''}
                    {option.analyticsResponse.threeMonthPriceChangePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="detail-chart">
            <h4 className="chart-title">Динамика изменения цены</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => formatDate(value)}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`}
                  width={50}
                  domain={yAxisDomain}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: `1px solid var(--border)`,
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => formatPrice(value)}
                  labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
                  labelFormatter={(value) => formatDate(value)}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--accent)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {option.url && (
          <div className="detail-actions">
            <a 
              href={option.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="detail-url-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Перейти к объявлению</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvestmentDetailView

