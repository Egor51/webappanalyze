import { useState, useEffect, useRef } from 'react'
import './SearchForm.css'

const BASE_ROOM_OPTIONS = [
  { value: 'Студия', label: 'Студия' },
  { value: '1', label: '1 комн' },
  { value: '2', label: '2 комн' },
  { value: '3', label: '3 комн' },
  { value: '4+', label: '4+ комн' },
]

const DISTRICT_OPTIONS = [
  { value: 'Октябрьский', label: 'Октябрьский' },
  { value: 'Первомайский', label: 'Первомайский' },
  { value: 'Ленинский', label: 'Ленинский' },
]

const getRoomOptions = (searchType) => {
  if (searchType === 'district') {
    return [
      { value: 'Весь район', label: 'Весь район' },
      ...BASE_ROOM_OPTIONS
    ]
  }
  if (searchType === 'city') {
    return [
      { value: 'Весь город', label: 'Весь город' },
      ...BASE_ROOM_OPTIONS
    ]
  }
  return BASE_ROOM_OPTIONS
}

const SEARCH_TYPES = [
  { 
    value: 'address', 
    label: 'Адрес', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    placeholder: 'Мурманск Александрова 30/2',
    labelText: 'Адрес недвижимости'
  },
  { 
    value: 'district', 
    label: 'Район', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
      </svg>
    ),
    placeholder: 'Октябрьский район, Первомайский район',
    labelText: 'Район недвижимости'
  },
  { 
    value: 'city', 
    label: 'Город', 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18"></path>
        <path d="M5 21V7l8-4v18"></path>
        <path d="M19 21V11l-6-4"></path>
        <line x1="9" y1="9" x2="9" y2="9"></line>
        <line x1="9" y1="12" x2="9" y2="12"></line>
        <line x1="9" y1="15" x2="9" y2="15"></line>
        <line x1="9" y1="18" x2="9" y2="18"></line>
      </svg>
    ),
    placeholder: 'Мурманск',
    labelText: 'Город'
  },
]

const SearchForm = ({ onSearch, searchType: externalSearchType, onSearchTypeChange }) => {
  // Используем внешний searchType, если передан, иначе внутреннее состояние
  const [internalSearchType, setInternalSearchType] = useState('address')
  const searchType = externalSearchType !== undefined ? externalSearchType : internalSearchType
  const setSearchType = onSearchTypeChange || setInternalSearchType
  const [address, setAddress] = useState('')
  const [countRoom, setCountRoom] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false)
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)

  // Запрос suggestions с debounce
  useEffect(() => {
    if (searchType === 'district') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const query = address.trim()
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      setIsSuggestionSelected(false) // Сбрасываем флаг при очистке
      return
    }

    // Если был выбран suggestion, не загружаем новые suggestions
    if (isSuggestionSelected) {
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const baseUrl = 'https://murmanclick.ru'
        let apiUrl = ''
        
        if (searchType === 'address') {
          apiUrl = `${baseUrl}/ads/address/suggestion?query=${encodeURIComponent(query)}`
        } else if (searchType === 'city') {
          apiUrl = `${baseUrl}/ads/address/city?query=${encodeURIComponent(query)}`
        }

        if (apiUrl) {
          const response = await fetch(apiUrl, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              'Accept': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            // Предполагаем, что API возвращает массив строк или объектов с полем name/address
            const suggestionsList = Array.isArray(data) 
              ? data.map(item => typeof item === 'string' ? item : (item.name || item.address || item))
              : []
            setSuggestions(suggestionsList)
            // Не показываем suggestions автоматически, если был выбран suggestion
            if (!isSuggestionSelected) {
              setShowSuggestions(suggestionsList.length > 0)
            }
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [address, searchType, isSuggestionSelected])

  // Закрытие suggestions при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSuggestionSelect = (suggestion) => {
    setAddress(suggestion)
    setShowSuggestions(false)
    setSuggestions([]) // Очищаем suggestions после выбора
    setIsSuggestionSelected(true) // Устанавливаем флаг, что suggestion был выбран
    inputRef.current?.blur() // Убираем фокус с input
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setAddress(value)
    setIsSuggestionSelected(false) // Сбрасываем флаг при ручном изменении текста
    // Показываем suggestions только если есть текст и список не был закрыт вручную
    if (value.trim().length >= 2) {
      // Не устанавливаем showSuggestions здесь, это сделает useEffect после загрузки
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    const isValid = searchType === 'district' 
      ? address.trim() && countRoom  // Для района address содержит выбранный район
      : address.trim() && countRoom
    
    if (isValid) {
      // Отправка события в Яндекс.Метрику
      if (window.ym) {
        window.ym(105200711, 'reachGoal', 'vanalyze')
      }
      onSearch(address.trim(), countRoom, searchType)
    }
  }

  const currentSearchType = SEARCH_TYPES.find(type => type.value === searchType) || SEARCH_TYPES[0]
  const roomOptions = getRoomOptions(searchType)

  return (
    <div className="search-form-wrapper">
      <div className="search-tabs">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            className={`search-tab ${searchType === type.value ? 'active' : ''}`}
            onClick={() => {
              setSearchType(type.value)
              setAddress('') // Очищаем поле при смене типа поиска
              setCountRoom('') // Очищаем выбор комнат при смене типа поиска
              setSuggestions([]) // Очищаем suggestions
              setShowSuggestions(false) // Скрываем список suggestions
              setIsSuggestionSelected(false) // Сбрасываем флаг выбора
            }}
            title={`Анализ цен по ${type.label.toLowerCase()}`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={searchType === 'district' ? undefined : 'address'} className="form-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {currentSearchType.value === 'address' && (
                <>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </>
              )}
              {currentSearchType.value === 'district' && (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                </>
              )}
              {currentSearchType.value === 'city' && (
                <>
                  <path d="M3 21h18"></path>
                  <path d="M5 21V7l8-4v18"></path>
                  <path d="M19 21V11l-6-4"></path>
                  <line x1="9" y1="9" x2="9" y2="9"></line>
                  <line x1="9" y1="12" x2="9" y2="12"></line>
                  <line x1="9" y1="15" x2="9" y2="15"></line>
                  <line x1="9" y1="18" x2="9" y2="18"></line>
                </>
              )}
            </svg>
            {currentSearchType.labelText}
          </label>
          {searchType === 'district' ? (
            <div className="district-options">
              {DISTRICT_OPTIONS.map((district) => (
                <button
                  key={district.value}
                  type="button"
                  className={`district-option ${address === district.value ? 'active' : ''}`}
                  onClick={() => setAddress(district.value)}
                >
                  <span>{district.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="input-with-suggestions">
              <input
                ref={inputRef}
                id="address"
                type="text"
                className="form-input"
                placeholder={currentSearchType.placeholder}
                value={address}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                required
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-list" ref={suggestionsRef}>
                  {isLoadingSuggestions ? (
                    <div className="suggestion-item loading">
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{suggestion}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      <div className="form-group">
        <label className="form-label">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          Количество комнат
        </label>
        <div className="room-options">
          {roomOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`room-option ${countRoom === option.value ? 'active' : ''}`}
              onClick={() => setCountRoom(option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-button" 
        disabled={
          searchType === 'district' 
            ? !address || !countRoom  // Для района проверяем что выбран район
            : !address.trim() || !countRoom  // Для адреса и города проверяем что введен текст
        }
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        Узнать цену
      </button>
      </form>
    </div>
  )
}

export default SearchForm

