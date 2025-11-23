import { useState, useEffect, useCallback } from 'react'
import { getMockInvestmentOptions, getMockBestOptions } from '../data/investmentTestData'
import InvestmentDetailView from './InvestmentDetailView'
import { buildApiUrl, API_CONFIG } from '../config/api'
import { validateInvestmentOptionsArray, getInvestmentDataStats } from '../utils/investmentDataValidator'
import './Investing.css'

// Флаг для использования тестовых данных (для разработки)
const USE_MOCK_DATA = false // Установите false для использования реального API

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

// Генерация уникального ключа для элемента списка
const getOptionKey = (option, index) => {
  if (option.url) {
    return option.url
  }
  if (option.fullAddress) {
    return `${option.fullAddress}-${option.price || index}`
  }
  return `option-${index}`
}

const Investing = () => {
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [investmentOptions, setInvestmentOptions] = useState([])
  const [bestOptions, setBestOptions] = useState([])
  const [activeTab, setActiveTab] = useState('input') // 'input' или 'best'
  const [selectedOption, setSelectedOption] = useState(null) // Выбранный вариант для детального просмотра

  // Загрузка лучших вариантов при монтировании
  const loadBestOptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (USE_MOCK_DATA) {
        // Используем тестовые данные
        await new Promise(resolve => setTimeout(resolve, 500)) // Имитация задержки сети
        const mockData = getMockBestOptions()
        setBestOptions(mockData)
      } else {
        // Используем реальный API
        const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.INVEST_TOP)
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`)
        }

        const data = await response.json()
        
        // Валидация и нормализация данных
        const validatedData = validateInvestmentOptionsArray(Array.isArray(data) ? data : [])
        
        if (import.meta.env.DEV) {
          console.log('Данные лучших вариантов (raw):', data)
          console.log('Данные лучших вариантов (validated):', validatedData)
          const stats = getInvestmentDataStats(validatedData)
          console.log('Статистика данных:', stats)
        }
        
        setBestOptions(validatedData)
      }
    } catch (err) {
      console.error('Ошибка загрузки лучших вариантов:', err)
      setError(err.message || 'Не удалось загрузить лучшие варианты')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBestOptions()
  }, [loadBestOptions])

  const handleSearch = useCallback(async (e) => {
    e.preventDefault()
    
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      setError('Введите корректную сумму инвестиций')
      return
    }

    setLoading(true)
    setError(null)
    setInvestmentOptions([])
    setSelectedOption(null)

    try {
      const amount = parseFloat(investmentAmount)
      
      if (USE_MOCK_DATA) {
        // Используем тестовые данные
        await new Promise(resolve => setTimeout(resolve, 800)) // Имитация задержки сети
        const mockData = getMockInvestmentOptions(amount)
        setInvestmentOptions(mockData)
      } else {
        // Используем реальный API
        const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.INVEST_BY_BUDGET, { budget: amount })
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`)
        }

        const data = await response.json()
        
        // Валидация и нормализация данных
        const validatedData = validateInvestmentOptionsArray(Array.isArray(data) ? data : [])
        
        if (import.meta.env.DEV) {
          console.log('Данные поиска по бюджету (raw):', data)
          console.log('Данные поиска по бюджету (validated):', validatedData)
          const stats = getInvestmentDataStats(validatedData)
          console.log('Статистика данных:', stats)
        }
        
        setInvestmentOptions(validatedData)
      }
    } catch (err) {
      console.error('Ошибка поиска инвестиционных вариантов:', err)
      setError(err.message || 'Не удалось найти варианты инвестиций. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }, [investmentAmount])

  const handleAmountChange = useCallback((e) => {
    const value = e.target.value.replace(/\s/g, '')
    if (value === '' || /^\d+$/.test(value)) {
      setInvestmentAmount(value)
    }
  }, [])

  const formatInputValue = useCallback((value) => {
    if (!value) return ''
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }, [])

  const handleCardClick = useCallback((option) => {
    setSelectedOption(option)
  }, [])

  const handleBackFromDetail = useCallback(() => {
    setSelectedOption(null)
  }, [])

  return (
    <div className="investing-screen">
      <div className="investing-title-section">
        <h2>Инвестиции</h2>
      </div>

      <div className="investing-tabs">
        <button
          className={`investing-tab ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Поиск по сумме</span>
        </button>
        <button
          className={`investing-tab ${activeTab === 'best' ? 'active' : ''}`}
          onClick={() => setActiveTab('best')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Лучшие варианты</span>
        </button>
      </div>

      {activeTab === 'input' && (
        <div className="investing-input-section">
          <div className="investing-card">
            <div className="investing-card-header">
              <div className="investing-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"></path>
                  <path d="M12 6v12M6 12h12"></path>
                </svg>
              </div>
              <h3>Введите сумму инвестиций</h3>
              <p>Укажите сумму, которую вы готовы инвестировать в недвижимость Мурманска и Мурманской области</p>
            </div>
            
            <form onSubmit={handleSearch} className="investing-form">
              <div className="investing-input-wrapper">
                <label htmlFor="investment-amount">Сумма инвестиций (₽)</label>
                <div className="investing-input-container">
                  <input
                    id="investment-amount"
                    type="text"
                    className="investing-input"
                    value={formatInputValue(investmentAmount)}
                    onChange={handleAmountChange}
                    placeholder="Например: 5 000 000"
                    required
                  />
                  <span className="investing-currency">₽</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="investing-submit-button"
                disabled={loading || !investmentAmount}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    <span>Поиск...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span>Найти варианты</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="investing-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {selectedOption ? (
            <InvestmentDetailView 
              option={selectedOption} 
              onBack={handleBackFromDetail} 
            />
          ) : investmentOptions.length > 0 ? (
            <div className="investment-results">
              <h3 className="results-title">Найдено вариантов: {investmentOptions.length}</h3>
              <div className="best-options-list">
                {investmentOptions.map((option, index) => (
                  <div 
                    key={getOptionKey(option, index)} 
                    className="best-option-card clickable"
                    onClick={() => handleCardClick(option)}
                  >
                    <div className="best-option-rank">
                      <span>#{index + 1}</span>
                    </div>
                    <div className="best-option-content">
                      <div className="best-option-header">
                        <h4 className="best-option-address">{option.fullAddress || 'Адрес не указан'}</h4>
                      </div>
                      
                      <div className="best-option-stats">
                        {option.square != null && (
                          <div className="best-stat-item">
                            <span className="best-stat-label">Площадь:</span>
                            <span className="best-stat-value">{option.square} м²</span>
                          </div>
                        )}
                        {option.countRoom != null && (
                          <div className="best-stat-item">
                            <span className="best-stat-label">Комнат:</span>
                            <span className="best-stat-value">{option.countRoom}</span>
                          </div>
                        )}
                        {option.price != null && (
                          <div className="best-stat-item">
                            <span className="best-stat-label">Цена:</span>
                            <span className="best-stat-value">{formatPrice(option.price)}</span>
                          </div>
                        )}
                        {option.differencePercent != null && (
                          <div className="best-stat-item highlight">
                            <span className="best-stat-label">
                              {option.differencePercent < 0 ? 'Дешевле рынка' : 'Дороже рынка'}:
                            </span>
                            <span className={`best-stat-value ${option.differencePercent < 0 ? 'positive' : 'negative'}`}>
                              {option.differencePercent >= 0 ? '+' : ''}
                              {option.differencePercent.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {option.analyticsResponse?.annualPriceChangePercent != null && (
                          <div className="best-stat-item highlight">
                            <span className="best-stat-label">Рост за год:</span>
                            <span className={`best-stat-value ${option.analyticsResponse.annualPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                              {option.analyticsResponse.annualPriceChangePercent >= 0 ? '+' : ''}
                              {option.analyticsResponse.annualPriceChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {option.analyticsResponse?.threeMonthPriceChangePercent != null && (
                          <div className="best-stat-item">
                            <span className="best-stat-label">Рост за 3 мес:</span>
                            <span className={`best-stat-value ${option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                              {option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? '+' : ''}
                              {option.analyticsResponse.threeMonthPriceChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'best' && (
        <div className="investing-best-section">
          {selectedOption ? (
            <InvestmentDetailView 
              option={selectedOption} 
              onBack={handleBackFromDetail} 
            />
          ) : (
            <>
              {loading && bestOptions.length === 0 ? (
                <div className="investing-loading">
                  <div className="loading-spinner"></div>
                  <p>Загрузка лучших вариантов...</p>
                </div>
              ) : error && bestOptions.length === 0 ? (
                <div className="investing-error-card">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3>Ошибка загрузки</h3>
                  <p>{error}</p>
                  <button className="retry-button" onClick={loadBestOptions}>
                    Попробовать снова
                  </button>
                </div>
              ) : (
                <>
                  <div className="best-options-header">
                    <h3>Лучшие варианты для инвестиций</h3>
                    <p>Объекты с наилучшей динамикой роста цен</p>
                  </div>
                  
                  {bestOptions.length > 0 ? (
                    <div className="best-options-list">
                      {bestOptions.map((option, index) => (
                        <div 
                          key={getOptionKey(option, index)} 
                          className="best-option-card clickable"
                          onClick={() => handleCardClick(option)}
                        >
                          <div className="best-option-rank">
                            <span>#{index + 1}</span>
                          </div>
                          <div className="best-option-content">
                            <div className="best-option-header">
                              <h4 className="best-option-address">{option.fullAddress || 'Адрес не указан'}</h4>
                            </div>
                            
                            <div className="best-option-stats">
                              {option.square != null && (
                                <div className="best-stat-item">
                                  <span className="best-stat-label">Площадь:</span>
                                  <span className="best-stat-value">{option.square} м²</span>
                                </div>
                              )}
                              {option.countRoom != null && (
                                <div className="best-stat-item">
                                  <span className="best-stat-label">Комнат:</span>
                                  <span className="best-stat-value">{option.countRoom}</span>
                                </div>
                              )}
                              {option.price != null && (
                                <div className="best-stat-item">
                                  <span className="best-stat-label">Цена:</span>
                                  <span className="best-stat-value">{formatPrice(option.price)}</span>
                                </div>
                              )}
                              {option.differencePercent != null && (
                                <div className="best-stat-item highlight">
                                  <span className="best-stat-label">
                                    {option.differencePercent < 0 ? 'Дешевле рынка' : 'Дороже рынка'}:
                                  </span>
                                  <span className={`best-stat-value ${option.differencePercent < 0 ? 'positive' : 'negative'}`}>
                                    {option.differencePercent >= 0 ? '+' : ''}
                                    {option.differencePercent.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                              {option.analyticsResponse?.annualPriceChangePercent != null && (
                                <div className="best-stat-item highlight">
                                  <span className="best-stat-label">Рост за год:</span>
                                  <span className={`best-stat-value ${option.analyticsResponse.annualPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                                    {option.analyticsResponse.annualPriceChangePercent >= 0 ? '+' : ''}
                                    {option.analyticsResponse.annualPriceChangePercent.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              {option.analyticsResponse?.threeMonthPriceChangePercent != null && (
                                <div className="best-stat-item">
                                  <span className="best-stat-label">Рост за 3 мес:</span>
                                  <span className={`best-stat-value ${option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? 'positive' : 'negative'}`}>
                                    {option.analyticsResponse.threeMonthPriceChangePercent >= 0 ? '+' : ''}
                                    {option.analyticsResponse.threeMonthPriceChangePercent.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-best-options">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <h3>Варианты не найдены</h3>
                      <p>Пока нет данных о лучших вариантах для инвестиций</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Investing

