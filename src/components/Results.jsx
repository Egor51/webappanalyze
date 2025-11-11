import { useMemo, useState, useEffect } from 'react'
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
  const [shareSuccess, setShareSuccess] = useState(false)
  const [chartExpanded, setChartExpanded] = useState(false)
  const [showMinTooltip, setShowMinTooltip] = useState(false)
  const [showMaxTooltip, setShowMaxTooltip] = useState(false)
  
  // Обрабатываем данные: если это массив, берем первый элемент, иначе используем сам объект
  const result = Array.isArray(data) ? data[0] : data
  
  // Закрываем подсказки при клике на экран
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, что клик не был на кнопке подсказки
      if (!event.target.closest('.tooltip-trigger')) {
        setShowMinTooltip(false)
        setShowMaxTooltip(false)
      }
    }
    
    if (showMinTooltip || showMaxTooltip) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showMinTooltip, showMaxTooltip])

  // Логирование для отладки
  console.log('Results component - data:', data)
  console.log('Results component - result:', result)
  
  const handleShare = async () => {
    const shareText = `🏠 Оценка недвижимости\n\n${result.address}\n\n💰 Средняя цена: ${result.price} ₽\n📊 За м²: ${result.priceMeter} ₽\n📉 Мин: ${result.priceMin} ₽\n📈 Макс: ${result.priceMax} ₽\n\n📅 Изменение за год: ${result.annualPriceChangePercent > 0 ? '+' : ''}${result.annualPriceChangePercent.toFixed(2)}%\n📅 Изменение за 3 месяца: ${result.threeMonthPriceChangePercent > 0 ? '+' : ''}${result.threeMonthPriceChangePercent.toFixed(2)}%\n\n📱 MurmanClick - Оценка недвижимости Мурманска`
    
    try {
      // Пробуем использовать Web Share API
      if (navigator.share) {
        await navigator.share({
          title: 'Оценка недвижимости - MurmanClick',
          text: shareText,
        })
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
        return
      }
      
      // Пробуем использовать Telegram Web App Share
      if (window.Telegram?.WebApp?.shareUrl) {
        window.Telegram.WebApp.shareUrl(window.location.href, shareText)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
        return
      }
      
      // Fallback: копирование в буфер обмена
      await navigator.clipboard.writeText(shareText)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 3000)
    } catch (err) {
      // Если пользователь отменил шаринг, не показываем ошибку
      if (err.name !== 'AbortError') {
        console.error('Ошибка при попытке поделиться:', err)
        // Fallback на копирование
        try {
          await navigator.clipboard.writeText(shareText)
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 3000)
        } catch (clipboardErr) {
          console.error('Ошибка при копировании:', clipboardErr)
        }
      }
    }
  }

  const chartData = useMemo(() => {
    if (!result?.analytics) {
      console.log('No analytics data in result')
      return []
    }
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
        <button 
          className="share-button"
          onClick={handleShare}
          title="Поделиться отчетом"
        >
          {shareSuccess ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Скопировано!</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Поделиться</span>
            </>
          )}
        </button>
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
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₽</span>
            </div>
            <h3>Средняя цена</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="price-main">
            <span className="price-value">{result.price} ₽</span>
          </div>
          <div className="price-details">
            <div className="price-item">
              <span className="price-item-label">За м²</span>
              <span className="price-item-value">{result.priceMeter} ₽</span>
            </div>
            <div className="price-range">
              <div className="price-item">
                <span className="price-item-label">
                  Мин
                  <button 
                    className="tooltip-trigger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMinTooltip(!showMinTooltip)
                      setShowMaxTooltip(false)
                    }}
                    aria-label="Подсказка"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                  {showMinTooltip && (
                    <div className="tooltip">
                      Минимальная стоимость объекта на рынке недвижимости за 6 мес
                    </div>
                  )}
                </span>
                <span className="price-item-value">{result.priceMin} ₽</span>
              </div>
              <div className="price-item">
                <span className="price-item-label">
                  Макс
                  <button 
                    className="tooltip-trigger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMaxTooltip(!showMaxTooltip)
                      setShowMinTooltip(false)
                    }}
                    aria-label="Подсказка"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                  {showMaxTooltip && (
                    <div className="tooltip">
                      Максимальная стоимость объекта на рынке недвижимости за 6 месяцев
                    </div>
                  )}
                </span>
                <span className="price-item-value">{result.priceMax} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    

      <div className="result-card stats-card">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3>Изменение цены</h3>
          </div>
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
      {chartData.length > 0 && (
        <>
          <div className="result-card chart-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 6 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 6 22 6 22 12"></polyline>
                  </svg>
                </div>
                <h3>Динамика изменения цены</h3>
              </div>
              <button 
                className="chart-expand-button"
                onClick={() => setChartExpanded(true)}
                title="Увеличить график"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              </button>
            </div>
            <div className="chart-container">
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
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`}
                    width={50}
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
            <div className="chart-disclaimer">
              <div className="disclaimer-header">
                <div className="disclaimer-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h4 className="disclaimer-title">Источник данных</h4>
              </div>
              <div className="disclaimer-content">
                <p>
                  Данные собраны из открытых источников и носят информационный характер. 
                  Оценка основана на анализе объявлений о продаже недвижимости и может отличаться 
                  от реальной рыночной стоимости.
                </p>
              </div>
              <button 
                className="consultation-button"
                onClick={() => {
                  // Открываем Telegram для консультации
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openTelegramLink('https://t.me/egor_018')
                  } else {
                    window.open('https://t.me/egor_018', '_blank')
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="12" y1="7" x2="12" y2="13"></line>
                </svg>
                <span>Получить консультацию по оценке</span>
              </button>
            </div>
          </div>

          {chartExpanded && (
            <div className="chart-modal" onClick={() => setChartExpanded(false)}>
              <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="chart-modal-header">
                  <h3>Динамика изменения цены</h3>
                  <button 
                    className="chart-modal-close"
                    onClick={() => setChartExpanded(false)}
                    aria-label="Закрыть"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="chart-modal-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М ₽`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card-bg)',
                          border: `1px solid var(--border)`,
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          padding: '10px 14px',
                        }}
                        formatter={(value) => formatPrice(value)}
                        labelStyle={{ color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--accent)', r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Results

