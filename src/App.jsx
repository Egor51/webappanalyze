import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Header from './components/Header'
import SearchForm from './components/SearchForm'
import Results from './components/Results'
import Loader from './components/Loader'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [telegramUser, setTelegramUser] = useState(null)

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

    try {
      // Формируем адрес: если не указан город, добавляем "Мурманск"
      let fullAddress = address.trim()
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
        // Пробуем сделать запрос с разными настройками для Chrome
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
        
        if (isChrome) {
          console.warn('Chrome detected - возможна проблема с CORS или SSL сертификатом')
        }
        
        // Chrome может выдавать разные типы ошибок
        if (fetchError.message && (
          fetchError.message.includes('CERT') || 
          fetchError.message.includes('certificate') ||
          fetchError.message.includes('ERR_CERT') ||
          fetchError.message.includes('ERR_SSL')
        )) {
          throw new Error('Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже.')
        }
        
        // Обработка различных типов сетевых ошибок
        if (
          fetchError.name === 'TypeError' ||
          fetchError.name === 'NetworkError' ||
          fetchError.message.includes('Failed to fetch') ||
          fetchError.message.includes('NetworkError') ||
          fetchError.message.includes('Network request failed') ||
          fetchError.message.includes('ERR_INTERNET_DISCONNECTED') ||
          fetchError.message.includes('ERR_NETWORK_CHANGED') ||
          fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
          fetchError.message.includes('ERR_CONNECTION_RESET')
        ) {
          // В Chrome "Failed to fetch" может означать разные проблемы
          // Проверяем, есть ли реальное подключение к интернету
          if (navigator.onLine === false) {
            throw new Error('Нет подключения к интернету. Проверьте ваше соединение.')
          }
          
          // Если есть интернет, но запрос не проходит, это может быть CORS или SSL
          throw new Error('Не удалось подключиться к серверу. Возможна проблема с сертификатом безопасности или настройками CORS.')
        }
        
        throw fetchError
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
      
      // Отправка данных на webhook после успешного анализа
      try {
        const webhookData = {
          telegramId: telegramUser?.id || null,
          address: fullAddress,
          countRoom: countRoom,
          firstName: telegramUser?.first_name || null
        }
        
        // Отправляем запрос на webhook (не ждем ответа, чтобы не блокировать UI)
        fetch('https://my-traffic.space/webhook-test/analyze', {
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
      
      if (err.message.includes('сертификат')) {
        errorMessage = 'Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже или обратитесь к администратору.'
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

  // Показываем начальный лоадер
  if (initialLoading) {
    return (
      <ThemeProvider>
        <div className="app">
          <Loader text="Загрузка приложения..." fullScreen={true} />
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
          {data && !loading && <Results data={data} />}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App

