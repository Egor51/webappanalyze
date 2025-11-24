import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import SearchHistory from './components/SearchHistory'
import Results from './components/Results'
import Loader from './components/Loader'
import Instructions from './components/Instructions'
import AllCitiesBlock from './components/AllCitiesBlock'
import CitiesAnalytics from './components/CitiesAnalytics'
import Investing from './components/Investing'
import InvestingAuthModal from './components/InvestingAuthModal'
import UrgentBuyPage from './components/UrgentBuyPage'
import { saveSearchToHistory } from './utils/searchHistory'
import { isInvestingAuthorized } from './utils/investingAuth'
import { getApiBaseUrl } from './config/api'
import './App.css'

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

  const handleSearch = async (address, countRoom, searchType = 'address', propertyType = 'all') => {
    setLoading(true)
    setError(null)
    setData(null)
    setNoData(false)

    // Сохраняем исходный адрес для истории
    const originalAddress = address.trim()

    try {
      const baseUrl = getApiBaseUrl()
      let apiUrl = ''
      
      // Проверяем, нужно ли добавлять параметр countRoom
      const shouldIncludeCountRoom = countRoom !== 'Весь' && countRoom !== 'Весь район' && countRoom !== 'Весь город'
      
      // Преобразуем propertyType в houseMaterial
      const houseMaterialValue = propertyType === 'new' ? 'Новостройка' : propertyType === 'secondary' ? 'Вторичка' : null
      
      if (searchType === 'city') {
        // Запрос по городу: https://murmanclick.ru/ads/analytic/city?city=Мурманск&countRoom=2&houseMaterial=Новостройка
        const params = new URLSearchParams()
        params.append('city', originalAddress)
        
        if (shouldIncludeCountRoom) {
          params.append('countRoom', countRoom)
        }
        
        if (houseMaterialValue) {
          params.append('houseMaterial', houseMaterialValue)
        }
        
        apiUrl = `${baseUrl}/ads/analytic/city?${params.toString()}`
      } else if (searchType === 'district') {
        // Запрос по району: https://murmanclick.ru/ads/analytic/district?district=Ленинский&countRoom=2&houseMaterial=Новостройка
        const params = new URLSearchParams()
        params.append('district', originalAddress)
        
        if (shouldIncludeCountRoom) {
          params.append('countRoom', countRoom)
        }
        
        if (houseMaterialValue) {
          params.append('houseMaterial', houseMaterialValue)
        }
        
        apiUrl = `${baseUrl}/ads/analytic/district?${params.toString()}`
      } else {
        // Запрос по адресу (старый формат)
        // Формируем адрес: если не указан город, добавляем "Мурманск"
        // НО: если адрес уже содержит название другого города (Оленегорск, Апатиты и т.д.), не добавляем Мурманск
        let fullAddress = originalAddress
        const addressLower = fullAddress.toLowerCase()
        
        // Список городов Мурманской области (кроме Мурманска)
        const otherCities = ['оленегорск', 'апатиты', 'кировск', 'мончегорск', 'полярные зори', 
                           'полярный', 'североморск', 'заозерск', 'гаджиево', 'снежногорск',
                           'кандалакша', 'кола', 'порья губа', 'заполярный', 'печенга']
        
        // Проверяем, содержит ли адрес название другого города
        const hasOtherCity = otherCities.some(city => addressLower.includes(city))
        const hasMurmansk = addressLower.includes('мурманск')
        
        // Добавляем "Мурманск" только если нет ни Мурманска, ни другого города
        if (!hasMurmansk && !hasOtherCity) {
          fullAddress = `Мурманск ${fullAddress}`
        }
        
        // Если в адресе нет "д" или "дом", добавляем "д"
        if (!fullAddress.match(/\s(д|дом)\s/i)) {
          // Ищем номер дома в конце адреса
          const houseMatch = fullAddress.match(/\s(\d+)$/)
          if (houseMatch) {
            fullAddress = fullAddress.replace(/\s(\d+)$/, ' д $1')
          }
        }
        
        apiUrl = `${baseUrl}/ads/analytic/v1.1?street=${encodeURIComponent(fullAddress)}&countRoom=${encodeURIComponent(countRoom)}`
      }
      
      // Логирование для отладки
      console.log('Запрос к API:', apiUrl)
      
      let response
      try {
        // Пробуем сделать запрос
        response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
        })
      } catch (fetchError) {
        // Обработка ошибок сети и SSL
        console.error('Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack,
          apiUrl: apiUrl
        })
        
        // Проверяем, доступен ли сервер через другой метод
        // Chrome может блокировать из-за SSL/CORS
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        const errorMessage = fetchError.message || ''
        const errorName = fetchError.name || ''
        const errorStack = fetchError.stack || ''
        const fullErrorText = `${errorMessage} ${errorStack}`.toUpperCase()
        
        if (isChrome) {
          console.warn('Chrome detected - возможна проблема с CORS или SSL сертификатом')
        }
        
        // Специальная обработка для отозванного сертификата (проверяем в сообщении и стеке)
        if (fullErrorText.includes('ERR_CERT_REVOKED') || 
            fullErrorText.includes('CERT_REVOKED') ||
            errorMessage.includes('ERR_CERT_REVOKED') ||
            errorStack.includes('ERR_CERT_REVOKED')) {
          // Chrome более строго проверяет сертификаты, Safari может работать
          if (isChrome) {
            throw new Error('Chrome блокирует подключение из-за проверки сертификата. Пожалуйста, используйте Safari или другой браузер. Проблема связана со строгой проверкой сертификатов в Chrome.')
          } else {
            throw new Error('Сертификат безопасности сервера был отозван. Это проблема на стороне сервера murmanclick.ru. Пожалуйста, обратитесь к администратору сервера для исправления сертификата.')
          }
        }
        
        // Проверка на SSL/CERT ошибки (более расширенная)
        const isSSLError = errorMessage.includes('CERT') || 
                          errorMessage.includes('certificate') ||
                          errorMessage.includes('ERR_CERT') ||
                          errorMessage.includes('ERR_SSL') ||
                          errorMessage.includes('SSL') ||
                          errorMessage.includes('TLS') ||
                          errorMessage.includes('certificate has expired') ||
                          errorMessage.includes('certificate is invalid') ||
                          errorMessage.includes('certificate is not trusted') ||
                          errorMessage.includes('ERR_CERT_AUTHORITY_INVALID') ||
                          errorMessage.includes('ERR_CERT_COMMON_NAME_INVALID') ||
                          errorStack.includes('ERR_CERT') ||
                          errorStack.includes('ERR_SSL')
        
        if (isSSLError) {
          // Chrome более строго проверяет сертификаты через OCSP
          if (isChrome) {
            throw new Error('Chrome блокирует подключение из-за проверки сертификата. Пожалуйста, используйте Safari или другой браузер. Chrome использует более строгую проверку сертификатов через OCSP.')
          } else {
            throw new Error('Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже или обратитесь к администратору.')
          }
        }
        
        // Обработка различных типов сетевых ошибок
        const isNetworkError = errorName === 'TypeError' ||
                              errorName === 'NetworkError' ||
                              errorMessage.includes('Failed to fetch') ||
                              errorMessage.includes('NetworkError') ||
                              errorMessage.includes('Network request failed') ||
                              errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
                              errorMessage.includes('ERR_NETWORK_CHANGED') ||
                              errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                              errorMessage.includes('ERR_CONNECTION_RESET') ||
                              errorMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
                              errorMessage.includes('ERR_NAME_NOT_RESOLVED')
        
        if (isNetworkError) {
          // В Chrome "Failed to fetch" может означать разные проблемы
          // Проверяем, есть ли реальное подключение к интернету
          if (navigator.onLine === false) {
            throw new Error('Нет подключения к интернету. Проверьте ваше соединение.')
          }
          
          // Если есть интернет, но запрос не проходит, это может быть CORS или SSL
          // В Chrome "Failed to fetch" часто означает SSL или CORS проблему
          if (isChrome && errorMessage.includes('Failed to fetch')) {
            throw new Error('Chrome блокирует подключение. Возможна проблема с проверкой сертификата. Пожалуйста, используйте Safari или другой браузер. Chrome использует более строгую проверку сертификатов.')
          }
          
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету и попробуйте позже.')
        }
        
        // Если это неизвестная ошибка, показываем общее сообщение
        throw new Error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.')
      }
      
      // Обработка статуса 204 - данные не найдены
      if (response.status === 204) {
        setNoData(true)
        setData(null)
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.error('Response error:', response.status, errorText)
        throw new Error(`Сервер вернул ошибку с кодом ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('Data:', data)
      
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
      
      // Сохраняем поиск в историю только для адресов (сохраняем исходный адрес)
      if (searchType === 'address') {
        saveSearchToHistory(originalAddress, countRoom)
        // Обновляем историю в UI
        setHistoryRefresh(prev => prev + 1)
      }
      
      // Отправка данных на webhook после успешного анализа
      try {
        const webhookData = {
          telegramId: telegramUser?.id || null,
          address: data?.address || fullAddress,
          countRoom: countRoom,
          firstName: telegramUser?.first_name || null
        }
        
        // Отправляем запрос на webhook (не ждем ответа, чтобы не блокировать UI)
        fetch('https://my-traffic.space/webhook/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        }).catch(webhookError => {
          // Логируем ошибку, но не показываем пользователю
          console.error('Ошибка при отправке данных на webhook:', webhookError)
        })
      } catch (webhookErr) {
        // Игнорируем ошибки webhook, чтобы не влиять на основной функционал
        console.error('Ошибка при подготовке данных для webhook:', webhookErr)
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
      
      // Более понятные сообщения об ошибках
      let errorMessage = 'Произошла ошибка при загрузке данных'
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      
      if (err.message.includes('сертификат') || err.message.includes('Chrome блокирует')) {
        // Если сообщение уже содержит информацию о Chrome, используем его
        if (err.message.includes('Chrome')) {
          errorMessage = err.message
        } else if (isChrome) {
          errorMessage = 'Chrome блокирует подключение из-за проверки сертификата. Пожалуйста, используйте Safari или другой браузер.'
        } else {
          errorMessage = 'Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже или обратитесь к администратору.'
        }
      } else if (err.message.includes('подключиться')) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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

  const handleGetAllCities = async () => {
    setCitiesLoading(true)
    setCitiesError(null)
    setCitiesData(null)
    setData(null)
    setError(null)
    setNoData(false)

    try {
      const baseUrl = getApiBaseUrl()
      const params = new URLSearchParams()
      params.append('page', '0')
      params.append('size', '50')
      
      const apiUrl = `${baseUrl}/ads/analytic/city/all?${params.toString()}`
      
      console.log('Запрос к API для всех городов:', apiUrl)
      
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
        throw new Error(`Сервер вернул ошибку с кодом ${response.status}`)
      }

      const data = await response.json()
      console.log('Данные всех городов:', data)
      
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
  }


  const handleBackFromCities = () => {
    setCitiesData(null)
    setCitiesError(null)
  }

  const handleNavigateToInvesting = () => {
    // Проверяем авторизацию перед переходом
    const authorized = isInvestingAuthorized()
    if (authorized) {
      const path = getPathFromScreen('investing')
      window.history.pushState({ screen: 'investing' }, '', path)
      setCurrentScreen('investing')
      setData(null)
      setError(null)
      setCitiesData(null)
      setCitiesError(null)
    } else {
      // Открываем модальное окно авторизации
      setIsInvestingAuthModalOpen(true)
    }
  }

  const handleInvestingAuthSuccess = () => {
    setInvestingAuthStatus(true)
    const path = getPathFromScreen('investing')
    window.history.pushState({ screen: 'investing' }, '', path)
    setCurrentScreen('investing')
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }

  const handleInvestingAuthModalClose = () => {
    setIsInvestingAuthModalOpen(false)
  }

  const handleBackFromInvesting = () => {
    const path = getPathFromScreen('search')
    window.history.pushState({ screen: 'search' }, '', path)
    setCurrentScreen('search')
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }

  const handleNavigateToSearch = () => {
    const path = getPathFromScreen('search')
    window.history.pushState({ screen: 'search' }, '', path)
    setCurrentScreen('search')
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }

  const handleNavigateToUrgentBuy = () => {
    const path = getPathFromScreen('urgent-buy')
    window.history.pushState({ screen: 'urgent-buy' }, '', path)
    setCurrentScreen('urgent-buy')
    setData(null)
    setError(null)
    setCitiesData(null)
    setCitiesError(null)
  }

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
            <Investing />
          ) : currentScreen === 'urgent-buy' ? (
            <UrgentBuyPage 
              onNavigateToSearch={handleNavigateToSearch}
              onNavigateToInvesting={handleNavigateToInvesting}
            />
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
            <CitiesAnalytics 
              data={citiesData} 
              onBack={handleBackFromCities}
            />
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
          {data && !loading && !citiesData && <Results data={data} onNewSearch={handleNewSearch} />}
          </>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App


