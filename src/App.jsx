import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './shared/components/Header'
import SearchForm from './domains/search/components/SearchForm'
import SearchHistory from './domains/search/components/SearchHistory'
import Loader from './shared/components/Loader'
import Instructions from './domains/search/components/Instructions'
import AllCitiesBlock from './domains/search/components/AllCitiesBlock'
import InvestingAuthModal from './domains/investing/components/InvestingAuthModal'
import PushNotification from './shared/components/PushNotification'
import { useInvestingAuth } from './domains/auth/hooks'
import { apiClient } from './lib/api-client'
import { useSearchMutation } from './domains/search/hooks'
import { logger } from './shared/utils/logger'
import { isInvestingAuthorized } from './shared/utils/investingAuth'
import './App.css'

// Lazy loading для тяжелых компонентов
const Results = lazy(() => import('./domains/search/components/Results'))
const CitiesAnalytics = lazy(() => import('./domains/search/components/CitiesAnalytics'))
const Investing = lazy(() => import('./domains/investing/components/Investing'))
const UrgentBuyPage = lazy(() => import('./domains/urgent-sale/components/UrgentBuyPage'))

function App() {
  const [data, setData] = useState(null)
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
  const [_investingAuthStatus, setInvestingAuthStatus] = useState(false)
  const [isTelegramUser, setIsTelegramUser] = useState(false)
  const [isTelegramNotificationClosed, setIsTelegramNotificationClosed] = useState(false)
  const [isUrgentBuyNotificationClosed, setIsUrgentBuyNotificationClosed] = useState(false)
  const [showTelegramPush, setShowTelegramPush] = useState(false)
  const [showUrgentBuyPush, setShowUrgentBuyPush] = useState(false)
  const [showUrgentBuyPushAfterReport, setShowUrgentBuyPushAfterReport] = useState(false)
  const [isUrgentBuyAfterReportClosed, setIsUrgentBuyAfterReportClosed] = useState(false)

  // React Query mutation для поиска (объявляем до всех useEffect, которые его используют)
  const searchMutation = useSearchMutation()

  // Синхронизируем loading состояние с mutation (объявляем до использования в useEffect)
  const loading = searchMutation.isPending

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

  // React Query hook для проверки авторизации инвестиций
  const { data: investingAuth, isLoading: authLoading } = useInvestingAuth()

  useEffect(() => {
    // Синхронизируем статус авторизации из React Query
    if (investingAuth) {
      setInvestingAuthStatus(investingAuth.isAuthorized)
    }

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
    const handlePopState = (_event) => {
      const newPathname = window.location.pathname
      const newScreen = getScreenFromPath(newPathname)
      setCurrentScreen(newScreen)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [investingAuth])

  // Задержка показа push-уведомлений (4 секунды)
  useEffect(() => {
    // Сбрасываем состояние показа при смене экрана
    setShowTelegramPush(false)
    setShowUrgentBuyPush(false)

    // Запускаем таймер на 4 секунды
    const timer = setTimeout(() => {
      if (currentScreen === 'search' && !isTelegramUser && !isTelegramNotificationClosed) {
        setShowTelegramPush(true)
      }
      if (currentScreen === 'urgent-buy' && !isUrgentBuyNotificationClosed) {
        setShowUrgentBuyPush(true)
      }
    }, 4000)

    return () => {
      clearTimeout(timer)
    }
  }, [currentScreen, isTelegramUser, isTelegramNotificationClosed, isUrgentBuyNotificationClosed])

  // Push-уведомление после получения отчета по оценке адреса (после ответа от сервера)
  useEffect(() => {
    // Сбрасываем состояние при изменении данных
    setShowUrgentBuyPushAfterReport(false)

    // Если загрузка завершена, есть данные и это поиск по адресу, запускаем таймер
    // Таймер запускается после получения ответа от сервера (когда loading становится false)
    // Используем searchMutation.isPending напрямую, чтобы избежать проблем с порядком инициализации
    if (!searchMutation.isPending && data && searchType === 'address' && currentScreen === 'search' && !isUrgentBuyAfterReportClosed) {
      const timer = setTimeout(() => {
        setShowUrgentBuyPushAfterReport(true)
      }, 4000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [searchMutation.isPending, data, searchType, currentScreen, isUrgentBuyAfterReportClosed])

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
        setIsTelegramUser(true)
        logger.info('Данные пользователя Telegram', user, { context: 'Telegram', sanitize: true })
      }
      
      // Другие доступные данные (только в dev режиме):
      logger.debug('Дополнительные данные Telegram', {
        version: tg.version,
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        headerColor: tg.headerColor,
        backgroundColor: tg.backgroundColor,
        isExpanded: tg.isExpanded,
        // Не логируем initData и initDataUnsafe - могут содержать чувствительные данные
      }, { context: 'Telegram', sanitize: true })
    } else {
      setIsTelegramUser(false)
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

  // Оптимизированная функция поиска с использованием React Query
  const handleSearch = useCallback(async (address, countRoom, searchType = 'address', propertyType = 'all') => {
    setError(null)
    setData(null)
    setNoData(false)

    try {
      const result = await searchMutation.mutateAsync({
        address,
        countRoom,
        searchType,
        propertyType,
      })

      // Обработка результата
      if (result.isEmpty) {
        setNoData(true)
        setData(null)
        return
      }

      setData(result.data)

      // Обновляем историю для адресов
      if (searchType === 'address') {
        setHistoryRefresh(prev => prev + 1)
      }

      // Отправка данных на webhook (не блокируем UI)
      if (telegramUser) {
        const webhookData = {
          telegramId: telegramUser.id || null,
          address: result.data?.address || address.trim(),
          countRoom: countRoom,
          firstName: telegramUser.first_name || null,
        }

        apiClient.post('https://my-traffic.space/webhook/analyze', webhookData).catch(err => {
          logger.error('Ошибка при отправке данных на webhook', err, { context: 'Webhook' })
        })
      }
    } catch (err) {
      logger.error('Ошибка при загрузке данных', err, { context: 'Search' })
      setError(err.message || 'Произошла ошибка при загрузке данных')
    }
  }, [searchMutation, telegramUser])

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
      logger.error('Ошибка при загрузке данных всех городов', err, { context: 'Cities' })
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

  const _handleBackFromInvesting = useCallback(() => {
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
            <Suspense fallback={<Loader text="Загрузка инвестиций..." />}>
              <Investing />
            </Suspense>
          ) : currentScreen === 'urgent-buy' ? (
            <Suspense fallback={<Loader text="Загрузка страницы..." />}>
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
            <Suspense fallback={<Loader text="Загрузка аналитики городов..." />}>
              <CitiesAnalytics 
                data={citiesData} 
                onBack={handleBackFromCities}
              />
            </Suspense>
          )}
          {loading && !citiesLoading && <Loader text="Поиск данных..." />}
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
            <Suspense fallback={<Loader text="Загрузка результатов..." />}>
              <Results data={data} onNewSearch={handleNewSearch} />
            </Suspense>
          )}
          </>
          )}
        </main>
      </div>
      {/* Подсчет активных push-уведомлений для правильного позиционирования */}
      {(() => {
        const activeNotifications = []
        let notificationIndex = 0

        // Push-уведомление после получения отчета по оценке адреса (самое новое - сверху)
        const showAfterReport = showUrgentBuyPushAfterReport && currentScreen === 'search' && !isUrgentBuyAfterReportClosed
        if (showAfterReport) {
          activeNotifications.push(
            <PushNotification
              key="after-report"
              show={true}
              index={notificationIndex++}
              title="Продай недвижимость быстро"
              message="Заполни заявку"
              iconClassName="urgent-buy-push urgent-buy-icon"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              }
              onClick={() => {
                handleNavigateToUrgentBuy()
                // Прокручиваем к форме заявки после небольшой задержки для загрузки страницы
                setTimeout(() => {
                  const formSection = document.querySelector('.urgent-buy-form-section')
                  if (formSection) {
                    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
              onClose={() => setIsUrgentBuyAfterReportClosed(true)}
            />
          )
        }

        // Push-уведомление для перехода в Telegram (только для не-Telegram пользователей)
        const showTelegram = showTelegramPush && !isTelegramUser && currentScreen === 'search' && !isTelegramNotificationClosed
        if (showTelegram) {
          activeNotifications.push(
            <PushNotification
              key="telegram"
              show={true}
              index={notificationIndex++}
              title="Переходите в Telegram"
              message="Там удобнее"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              }
              onClick={() => window.open('https://t.me/murmanclick_bot', '_blank')}
              onClose={() => setIsTelegramNotificationClosed(true)}
            />
          )
        }

        return activeNotifications
      })()}
      {/* Push-уведомление для страницы "Продать" */}
      <PushNotification
        show={showUrgentBuyPush && currentScreen === 'urgent-buy' && !isUrgentBuyNotificationClosed}
        index={0}
        title="Продай недвижимость быстро"
        message="Заполни заявку"
        iconClassName="urgent-buy-push urgent-buy-icon"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        }
        onClick={() => {
          const formSection = document.querySelector('.urgent-buy-form-section');
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        onClose={() => setIsUrgentBuyNotificationClosed(true)}
      />
    </ThemeProvider>
  )
}

export default App


