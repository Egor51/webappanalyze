import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import SearchHistory from './components/SearchHistory'
import Loader from './components/Loader'
import Instructions from './components/Instructions'
import AllCitiesBlock from './components/AllCitiesBlock'
import InvestingAuthModal from './components/InvestingAuthModal'
import { saveSearchToHistory } from './utils/searchHistory'
import { isInvestingAuthorized } from './utils/investingAuth'
import { apiClient } from './api/client'
import { normalizeAddress } from './utils/formatters'
import './App.css'

// Lazy loading для тяжелых компонентов
const Results = lazy(() => import('./components/Results'))
const CitiesAnalytics = lazy(() => import('./components/CitiesAnalytics'))
const Investing = lazy(() => import('./components/Investing'))
const UrgentBuyPage = lazy(() => import('./components/UrgentBuyPage'))

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [noData, setNoData] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [telegramUser, setTelegramUser] = useState(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [searchType, setSearchType] = useState('address')
  const [citiesData, setCitiesData] = useState(null)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [citiesError, setCitiesError] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('search') // 'search', 'investing' или 'urgent-buy'
  const [isInvestingAuthModalOpen, setIsInvestingAuthModalOpen] = useState(false)
  const [investingAuthStatus, setInvestingAuthStatus] = useState(false)

  // Функция для определения экрана по пути
  const getScreenFromPath = (pathname) => {
    // Убираем base path если есть
    const basePath = '/webappanalyze'
    let cleanPath = pathname
    
    // Обрабатываем base path
    if (pathname.startsWith(basePath)) {
      cleanPath = pathname.slice(basePath.length) || '/'
    }
    
    // Также обрабатываем случай без base path (для dev режима)
    if (!cleanPath || cleanPath === '/') {
      // Проверяем, может быть путь уже без base path
      cleanPath = pathname
    }
    
    // Убираем trailing slash
    if (cleanPath.endsWith('/') && cleanPath.length > 1) {
      cleanPath = cleanPath.slice(0, -1)
    }
    
    if (cleanPath === '/investicii' || cleanPath.startsWith('/investicii')) {
      return 'investing'
    }
    if (cleanPath === '/srochnaya-pokupka' || cleanPath.startsWith('/srochnaya-pokupka')) {
      return 'urgent-buy'
    }
    // По умолчанию или для /analyse, / - экран поиска
    return 'search'
  }

  // Функция для получения пути по экрану
  const getPathFromScreen = (screen) => {
    const basePath = '/webappanalyze'
    let path = ''
    switch (screen) {
      case 'investing':
        path = '/investicii'
        break
      case 'urgent-buy':
        path = '/srochnaya-pokupka'
        break
      case 'search':
      default:
        path = '/analyse'
    }
    return basePath + path
  }

  useEffect(() => {
    // Проверяем авторизацию для раздела инвестиций
    const authorized = isInvestingAuthorized()
    setInvestingAuthStatus(authorized)

    // Определяем экран по текущему пути
    const pathname = window.location.pathname
    const screen = getScreenFromPath(pathname)
    
    // Устанавливаем экран
    setCurrentScreen(screen)
    
    // Если путь корневой, перенаправляем на /analyse
    const basePath = '/webappanalyze'
    let cleanPath = pathname
    if (pathname.startsWith(basePath)) {
      cleanPath = pathname.slice(basePath.length) || '/'
    }
    
    if (cleanPath === '/' || cleanPath === '') {
      const searchPath = getPathFromScreen('search')
      window.history.replaceState({ screen: 'search' }, '', searchPath)
      setCurrentScreen('search')
    }

    // Обработчик навигации назад/вперед
    const handlePopState = (event) => {
      const newPathname = window.location.pathname
      const newScreen = getScreenFromPath(newPathname)
      setCurrentScreen(newScreen)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Устанавливаем тему Telegram
      const theme = tg.colorScheme === 'dark' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      
      // Получаем данные пользователя из Telegram
      const user = tg.initDataUnsafe?.user
      if (user) {
        setTelegramUser(user)
        console.log('Данные пользователя Telegram:', {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium,
          photoUrl: user.photo_url
        })
      }
      
      // Другие доступные данные:
      console.log('Дополнительные данные Telegram:', {
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        headerColor: tg.headerColor,
        backgroundColor: tg.backgroundColor,
        isExpanded: tg.isExpanded,
        initData: tg.initData, // Строка с данными инициализации
        initDataUnsafe: tg.initDataUnsafe // Объект с распарсенными данными
      })
    }
    
    // Ждем загрузки DOM и минимальное время для плавности
    const initApp = async () => {
      // Ждем готовности DOM
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve)
        })
      }
      
      // Минимальное время для плавного появления (300ms)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setInitialLoading(false)
    }
    
    initApp()
  }, [])

  // Оптимизированная функция поиска с использованием API-клиента
  const handleSearch = useCallback(async (address, countRoom, searchType = 'address', propertyType = 'all') => {
    setLoading(true)
    setError(null)
    setData(null)
    setNoData(false)

    // Сохраняем исходный адрес для истории
    const originalAddress = address.trim()

    try {
      // Проверяем, нужно ли добавлять параметр countRoom
      const shouldIncludeCountRoom = countRoom !== 'Весь' && countRoom !== 'Весь район' && countRoom !== 'Весь город'
      
      // Преобразуем propertyType в houseMaterial
      const houseMaterialValue = propertyType === 'new' ? 'Новостройка' : propertyType === 'secondary' ? 'Вторичка' : null
      
      let data
      
      if (searchType === 'city') {
        const params = {
          city: originalAddress,
          ...(shouldIncludeCountRoom && { countRoom }),
          ...(houseMaterialValue && { houseMaterial: houseMaterialValue }),
        }
        data = await apiClient.get('/ads/analytic/city', params)
      } else if (searchType === 'district') {
        const params = {
          district: originalAddress,
          ...(shouldIncludeCountRoom && { countRoom }),
          ...(houseMaterialValue && { houseMaterial: houseMaterialValue }),
        }
        data = await apiClient.get('/ads/analytic/district', params)
      } else {
        // Запрос по адресу
        const fullAddress = normalizeAddress(originalAddress)
        const params = {
          street: fullAddress,
          countRoom,
        }
        data = await apiClient.get('/ads/analytic/v1.1', params)
      }
      
      // Обработка статуса 204 (данные не найдены)
      if (data === null) {
        setNoData(true)
        setData(null)
        setLoading(false)
        return
      }
      
      // Проверяем данные: могут быть массивом или объектом
      if (!data) {
        throw new Error('Данные не найдены')
      }
      
      // Если данные - массив, проверяем что он не пустой
      if (Array.isArray(data) && data.length === 0) {
        throw new Error('Данные не найдены')
      }
      
      // Если данные - объект, проверяем наличие обязательных полей
      if (!Array.isArray(data) && !data.address && !data.price) {
        throw new Error('Данные не найдены')
      }
      
      setData(data)
      
      // Сохраняем поиск в историю только для адресов
      if (searchType === 'address') {
        saveSearchToHistory(originalAddress, countRoom)
        setHistoryRefresh(prev => prev + 1)
      }
      
      // Отправка данных на webhook (не блокируем UI)
      if (telegramUser) {
        const webhookData = {
          telegramId: telegramUser.id || null,
          address: data?.address || originalAddress,
          countRoom: countRoom,
          firstName: telegramUser.first_name || null
        }
        
        apiClient.post('https://my-traffic.space/webhook/analyze', webhookData).catch(err => {
          console.error('Ошибка при отправке данных на webhook:', err)
        })
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
      setError(err.message || 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }, [telegramUser])

  const handleSelectFromHistory = (address, countRoom) => {
    // Устанавливаем значения в форму и выполняем поиск
    handleSearch(address, countRoom)
  }

  const handleNewSearch = () => {
    // Очищаем данные для нового поиска
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }

  // Оптимизированная функция загрузки всех городов
  const handleGetAllCities = useCallback(async () => {
    setCitiesLoading(true)
    setCitiesError(null)
    setCitiesData(null)
    setData(null)
    setError(null)
    setNoData(false)

    try {
      const data = await apiClient.get('/ads/analytic/city/all', {
        page: '0',
        size: '50',
      })
      
      if (!data || !data.content || data.content.length === 0) {
        setCitiesError('Данные не найдены')
        return
      }

      setCitiesData(data)
    } catch (err) {
      console.error('Ошибка при загрузке данных всех городов:', err)
      setCitiesError(err.message || 'Произошла ошибка при загрузке данных')
    } finally {
      setCitiesLoading(false)
    }
  }, [])


  // Мемоизированные функции навигации
  const handleBackFromCities = useCallback(() => {
    setCitiesData(null)
    setCitiesError(null)
  }, [])

  const clearAllData = useCallback(() => {
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }, [])

  const handleNavigateToInvesting = useCallback(() => {
    const authorized = isInvestingAuthorized()
    if (authorized) {
      const path = getPathFromScreen('investing')
      window.history.pushState({ screen: 'investing' }, '', path)
      setCurrentScreen('investing')
      clearAllData()
    } else {
      setIsInvestingAuthModalOpen(true)
    }
  }, [clearAllData])

  const handleInvestingAuthSuccess = useCallback(() => {
    setInvestingAuthStatus(true)
    const path = getPathFromScreen('investing')
    window.history.pushState({ screen: 'investing' }, '', path)
    setCurrentScreen('investing')
    clearAllData()
  }, [clearAllData])

  const handleInvestingAuthModalClose = useCallback(() => {
    setIsInvestingAuthModalOpen(false)
  }, [])

  const handleBackFromInvesting = useCallback(() => {
    const path = getPathFromScreen('search')
    window.history.pushState({ screen: 'search' }, '', path)
    setCurrentScreen('search')
    clearAllData()
  }, [clearAllData])

  const handleNavigateToSearch = useCallback(() => {
    const path = getPathFromScreen('search')
    window.history.pushState({ screen: 'search' }, '', path)
    setCurrentScreen('search')
    clearAllData()
  }, [clearAllData])

  const handleNavigateToUrgentBuy = useCallback(() => {
    const path = getPathFromScreen('urgent-buy')
    window.history.pushState({ screen: 'urgent-buy' }, '', path)
    setCurrentScreen('urgent-buy')
    clearAllData()
  }, [clearAllData])

  // Показываем начальный лоадер
  if (initialLoading) {
    return (
      <ThemeProvider>
        <div className="app">
          <Loader text="murmanclick..." fullScreen={true} />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="app">
        <Header 
          currentScreen={currentScreen}
          onNavigateToInvesting={handleNavigateToInvesting}
          onNavigateToSearch={handleNavigateToSearch}
          onNavigateToUrgentBuy={handleNavigateToUrgentBuy}
        />
        <main className="main-content">
          <InvestingAuthModal
            isOpen={isInvestingAuthModalOpen}
            onClose={handleInvestingAuthModalClose}
            onSuccess={handleInvestingAuthSuccess}
          />
          {currentScreen === 'investing' ? (
            <Suspense fallback={<Loader />}>
              <Investing />
            </Suspense>
          ) : currentScreen === 'urgent-buy' ? (
            <Suspense fallback={<Loader />}>
              <UrgentBuyPage 
                onNavigateToSearch={handleNavigateToSearch}
                onNavigateToInvesting={handleNavigateToInvesting}
              />
            </Suspense>
          ) : (
          <>
          <SearchForm 
            onSearch={handleSearch} 
            searchType={searchType}
            onSearchTypeChange={setSearchType}
          />
          {noData && !loading && (
            <div className="no-data-message">
              <div className="no-data-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3>Данные не найдены</h3>
              <p>По вашему запросу не найдено данных о недвижимости. Попробуйте изменить параметры поиска.</p>
            </div>
          )}
          {!data && !loading && !citiesData && !citiesLoading && (
            <AllCitiesBlock 
              onGetAllCities={handleGetAllCities}
              searchType={searchType}
            />
          )}
          {!data && !loading && !error && !noData && !citiesData && !citiesLoading && (
            <>
              {searchType === 'address' && (
                <SearchHistory 
                  onSelectSearch={handleSelectFromHistory}
                  refreshTrigger={historyRefresh}
                />
              )}
              <Instructions searchType={searchType} />
            </>
          )}
          {citiesLoading && <Loader />}
          {citiesError && (
            <div className="error-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{citiesError}</p>
            </div>
          )}
          {citiesData && !citiesLoading && (
            <Suspense fallback={<Loader />}>
              <CitiesAnalytics 
                data={citiesData} 
                onBack={handleBackFromCities}
              />
            </Suspense>
          )}
          {loading && !citiesLoading && <Loader />}
          {error && !citiesError && (
            <div className="error-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          )}
          {data && !loading && !citiesData && (
            <Suspense fallback={<Loader />}>
              <Results data={data} onNewSearch={handleNewSearch} />
            </Suspense>
          )}
          </>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App


