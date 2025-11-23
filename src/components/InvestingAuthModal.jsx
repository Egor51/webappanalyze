import { useState, useEffect, useRef } from 'react'
import { getApiBaseUrl } from '../config/api'
import { saveInvestingAuth } from '../utils/investingAuth'
import './InvestingAuthModal.css'

const InvestingAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setCode('')
      setError('')
    }
  }, [isOpen])

  const handleCodeChange = (e) => {
    const value = e.target.value.trim()
    setCode(value)
    setError('')
    
    // Проверяем код только после ввода 5 цифр
    if (value.length === 5) {
      checkCode(value)
    }
  }

  const checkCode = async (codeToCheck) => {
    setIsChecking(true)
    setError('')
    
    // Тестовый код для разработки
    const TEST_CODE = '29113'
    if (codeToCheck === TEST_CODE) {
      // Тестовый код валиден, сохраняем авторизацию
      saveInvestingAuth(codeToCheck)
      setIsChecking(false)
      onSuccess()
      onClose()
      return
    }
    
    try {
      const baseUrl = getApiBaseUrl()
      const apiUrl = `${baseUrl}/ads/invest/auth?code=${encodeURIComponent(codeToCheck)}`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid === true || data.success === true) {
          // Код валиден, сохраняем авторизацию
          saveInvestingAuth(codeToCheck)
          onSuccess()
          onClose()
        } else {
          setError('Неверный код авторизации')
        }
      } else if (response.status === 401 || response.status === 403) {
        setError('Неверный код авторизации')
      } else {
        setError('Ошибка при проверке кода')
      }
    } catch (err) {
      console.error('Ошибка при проверке кода:', err)
      // При ошибке сети показываем сообщение
      setError('Не удалось проверить код. Попробуйте позже или отправьте заявку.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleJoinClick = () => {
    // Открываем ссылку для присоединения к партнерской программе
    window.open('https://murmanclick.ru/partners', '_blank')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="investing-auth-modal-overlay" onClick={onClose}>
      <div className="investing-auth-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <button className="investing-auth-modal-close" onClick={onClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="investing-auth-modal-content">
          <div className="investing-auth-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          
          <h2 className="investing-auth-modal-title">
            🔒 Раздел доступен только партнёрам MurmanClick
          </h2>
          
          <p className="investing-auth-modal-description">
            Этот раздел разработан специально для партнёров MurmanClick.
          </p>
          
          <p className="investing-auth-modal-description">
            Вы можете ввести свой код авторизации или отправить заявку на подключение к партнерской программе.
          </p>
          
          <div className="investing-auth-modal-form">
            <label htmlFor="auth-code" className="investing-auth-modal-label">
              Код авторизации
            </label>
            <input
              ref={inputRef}
              id="auth-code"
              type="text"
              className={`investing-auth-modal-input ${error ? 'error' : ''}`}
              placeholder="Введите код"
              value={code}
              onChange={handleCodeChange}
              disabled={isChecking}
              autoComplete="off"
            />
            {isChecking && (
              <div className="investing-auth-modal-checking">
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
                <span>Проверка...</span>
              </div>
            )}
            {error && (
              <div className="investing-auth-modal-error">
                {error}
              </div>
            )}
          </div>
          
          {/* <button
            className="investing-auth-modal-join-button"
            onClick={handleJoinClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Присоединиться</span>
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default InvestingAuthModal

