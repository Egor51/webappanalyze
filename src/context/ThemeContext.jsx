import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Проверяем тему Telegram или сохраненную тему
    if (window.Telegram?.WebApp) {
      return window.Telegram.WebApp.colorScheme === 'dark' ? 'dark' : 'light'
    }
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    
    // Слушаем изменения темы Telegram
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('themeChanged', () => {
        const tgTheme = window.Telegram.WebApp.colorScheme === 'dark' ? 'dark' : 'light'
        setTheme(tgTheme)
      })
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

