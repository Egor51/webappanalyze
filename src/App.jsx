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
      
      const encodedAddress = encodeURIComponent(fullAddress)
      const encodedCountRoom = encodeURIComponent(countRoom)
      const url = `https://murmanclick.ru/ads/analytic/v1.1?street=${encodedAddress}&countRoom=${encodedCountRoom}`
      
      // Логирование для отладки (можно убрать в продакшене)
      console.log('Запрос к API:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ошибка API:', response.status, errorText)
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new Error('Данные не найдены')
      }
      
      setData(result)
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
      setError(err.message || 'Произошла ошибка при загрузке данных')
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

