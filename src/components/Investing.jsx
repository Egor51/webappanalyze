import { useState, useEffect, useCallback } from 'react'
import { getMockInvestmentOptions, getMockBestOptions } from '../data/investmentTestData'
import InvestmentDetailView from './InvestmentDetailView'
import MandatesList from './investing/MandatesList'
import TradeIdeaCard from './investing/TradeIdeaCard'
import EventsFeed from './investing/EventsFeed'
import InvestorProfile from './investing/InvestorProfile'
import { buildApiUrl, API_CONFIG } from '../config/api'
import { validateInvestmentOptionsArray, getInvestmentDataStats } from '../utils/investmentDataValidator'
import { matchesMandate, setMandateMatchCount, getMandates, getMandateMatchCount } from '../utils/mandateStorage'
import './Investing.css'

const getStrategyLabel = (strategy) => {
  const labels = {
    rent: 'Купить и сдавать',
    flip: 'Флип',
    parking: 'Парковка капитала'
  }
  return labels[strategy] || strategy
}

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
  const [activeTab, setActiveTab] = useState('deals') // 'deals', 'events', 'mandates', 'profile', 'input', 'best'
  const [selectedOption, setSelectedOption] = useState(null) // Выбранный вариант для детального просмотра
  const [selectedMandate, setSelectedMandate] = useState(null) // Выбранный мандат для фильтрации сделок
  // Проверяем localStorage для тестирования, иначе получать из профиля пользователя
  const [isPro, setIsPro] = useState(() => {
    const savedProStatus = localStorage.getItem('investing_pro_status')
    return savedProStatus === 'true' || true // Временно включен PRO для тестирования
  })
  const [mandates, setMandates] = useState([]) // Список мандатов для EventsFeed

  // Функция для переключения PRO статуса (для тестирования)
  useEffect(() => {
    const handleProToggle = (e) => {
      if (e.key === 'p' && e.ctrlKey && e.shiftKey) {
        const newProStatus = !isPro
        setIsPro(newProStatus)
        localStorage.setItem('investing_pro_status', newProStatus.toString())
        console.log('PRO статус переключен:', newProStatus)
      }
    }
    window.addEventListener('keydown', handleProToggle)
    return () => window.removeEventListener('keydown', handleProToggle)
  }, [isPro])

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
        let validatedData = validateInvestmentOptionsArray(Array.isArray(data) ? data : [])
        
        // Фильтрация по выбранному мандату, если есть
        if (selectedMandate) {
          validatedData = validatedData.filter(option => matchesMandate(option, selectedMandate))
          // Обновляем счетчик совпадений для мандата
          setMandateMatchCount(selectedMandate.id, validatedData.length)
        }
        
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
  }, [selectedMandate])

  useEffect(() => {
    loadBestOptions()
  }, [loadBestOptions, selectedMandate])

  useEffect(() => {
    // Загружаем мандаты для EventsFeed
    const savedMandates = getMandates()
    setMandates(savedMandates)
  }, [])

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
          className={`investing-tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>Сделки</span>
        </button>
        <button
          className={`investing-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span>События</span>
        </button>
        <button
          className={`investing-tab ${activeTab === 'mandates' ? 'active' : ''}`}
          onClick={() => setActiveTab('mandates')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          <span>Мандаты</span>
        </button>
        <button
          className={`investing-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Профиль</span>
        </button>
      </div>

      {activeTab === 'deals' && (
        <div className="investing-deals-section">
          {selectedOption ? (
            <InvestmentDetailView
              isPro={isPro} 
              option={selectedOption} 
              onBack={handleBackFromDetail} 
            />
          ) : (
            <>
              {/* Список мандатов для выбора, если не выбран мандат */}
              {!selectedMandate && mandates.length > 0 && (
                <div className="mandates-selector-section">
                  <h3 className="mandates-selector-title">Выберите мандат для фильтрации сделок</h3>
                  <div className="mandates-selector-grid">
                    {mandates.map(mandate => {
                      const matchCount = getMandateMatchCount(mandate.id)
                      return (
                        <div 
                          key={mandate.id} 
                          className="mandate-selector-card"
                          onClick={() => setSelectedMandate(mandate)}
                        >
                          <div className="mandate-selector-header">
                            <h4>{mandate.name || getStrategyLabel(mandate.strategy)}</h4>
                            <span className="mandate-selector-strategy">{getStrategyLabel(mandate.strategy)}</span>
                          </div>
                          <div className="mandate-selector-info">
                            <span className="mandate-selector-budget">
                              {mandate.budgetMin ? `${(mandate.budgetMin / 1000000).toFixed(1)} млн` : 'Любой'} — 
                              {mandate.budgetMax && mandate.budgetMax !== Infinity 
                                ? ` ${(mandate.budgetMax / 1000000).toFixed(1)} млн` 
                                : ' без ограничений'}
                            </span>
                            {matchCount > 0 && (
                              <span className="mandate-selector-count">{matchCount} объектов</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Фильтр по мандату */}
              {selectedMandate && (
                <div className="mandate-filter-banner">
                  <div className="mandate-filter-info">
                    <span className="mandate-filter-label">Активный фильтр:</span>
                    <span className="mandate-filter-name">{selectedMandate.name || 'Мандат'}</span>
                  </div>
                  <button 
                    className="mandate-filter-reset"
                    onClick={() => setSelectedMandate(null)}
                  >
                    Сбросить фильтр
                  </button>
                </div>
              )}

              {/* Временная поддержка старого функционала */}
              <div className="investing-legacy-tabs">
                <button
                  className={`investing-legacy-tab ${!selectedMandate ? 'active' : ''}`}
                  onClick={() => setSelectedMandate(null)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span>Лучшие варианты</span>
                </button>
                <button
                  className={`investing-legacy-tab ${selectedMandate ? 'active' : ''}`}
                  onClick={() => {
                    // Показываем список мандатов
                    setSelectedMandate(null)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"></path>
                  </svg>
                  <span>Поиск по сумме</span>
                </button>
              </div>

              {loading && bestOptions.length === 0 ? (
                <div className="investing-loading">
                  <div className="loading-spinner"></div>
                  <p>Загрузка сделок...</p>
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
                <div className="investing-options-grid">
                  {bestOptions.map((option, index) => (
                    <TradeIdeaCard
                      key={getOptionKey(option, index)}
                      option={option}
                      mandate={selectedMandate}
                      isPro={isPro}
                      onClick={() => setSelectedOption(option)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="investing-events-section">
          <EventsFeed isPro={isPro} mandates={mandates} />
        </div>
      )}

      {activeTab === 'mandates' && (
        <div className="investing-mandates-section">
          <MandatesList 
            isPro={isPro}
            onSelectMandate={(mandate) => {
              setSelectedMandate(mandate)
              setActiveTab('deals')
            }}
          />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="investing-profile-section">
          <InvestorProfile isPro={isPro} />
        </div>
      )}

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
              isPro={isPro} 
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
              isPro={isPro} 
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

