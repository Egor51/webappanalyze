import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import SearchHistory from './components/SearchHistory'
import Results from './components/Results'
import Loader from './components/Loader'
import Instructions from './components/Instructions'
import { saveSearchToHistory } from './utils/searchHistory'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [telegramUser, setTelegramUser] = useState(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)

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

  const handleSearch = async (address, countRoom) => {
    setLoading(true)
    setError(null)
    setData(null)

    // Сохраняем исходный адрес для истории
    const originalAddress = address.trim()

    try {
      // Формируем адрес: если не указан город, добавляем "Мурманск"
      let fullAddress = originalAddress
      if (!fullAddress.toLowerCase().includes('мурманск')) {
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
      
      const apiUrl = `https://murmanclick.ru/ads/analytic/v1.1?street=${encodeURIComponent(fullAddress)}&countRoom=${encodeURIComponent(countRoom)}`
      
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
      
      // Сохраняем поиск в историю (сохраняем исходный адрес)
      saveSearchToHistory(originalAddress, countRoom)
      // Обновляем историю в UI
      setHistoryRefresh(prev => prev + 1)
      
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
        <Header />
        <main className="main-content">
          <SearchForm onSearch={handleSearch} />
          {!data && !loading && !error && (
            <>
              <SearchHistory 
                onSelectSearch={handleSelectFromHistory}
                refreshTrigger={historyRefresh}
              />
              <Instructions />
            </>
          )}
          {loading && <Loader />}
          {error && (
            <div className="error-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{error}</p>
            </div>
          )}
          {data && !loading && <Results data={data} onNewSearch={handleNewSearch} />}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App

