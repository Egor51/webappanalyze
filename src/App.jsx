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

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Устанавливаем тему Telegram
      const theme = tg.colorScheme === 'dark' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
    }
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
        response = await fetch(apiUrl)
      } catch (fetchError) {
        // Обработка ошибок сети и SSL
        if (fetchError.message.includes('CERT') || fetchError.message.includes('certificate')) {
          throw new Error('Проблема с сертификатом безопасности сервера. Пожалуйста, попробуйте позже.')
        }
        if (fetchError.message.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету.')
        }
        throw fetchError
      }
      
      if (!response.ok) {
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

