import { useState } from 'react'
import './SearchForm.css'

const ROOM_OPTIONS = [
  { value: 'Студия', label: 'Студия' },
  { value: '1', label: '1 комн' },
  { value: '2', label: '2 комн' },
  { value: '3', label: '3 комн' },
  { value: '4+', label: '4+ комн' },
]

const SearchForm = ({ onSearch }) => {
  const [address, setAddress] = useState('')
  const [countRoom, setCountRoom] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (address.trim() && countRoom) {
      // Отправка события в Яндекс.Метрику
      if (window.ym) {
        window.ym(105200711, 'reachGoal', 'vanalyze')
      }
      onSearch(address.trim(), countRoom)
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="address" className="form-label">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Адрес недвижимости
        </label>
        <input
          id="address"
          type="text"
          className="form-input"
          placeholder="Мурманск Александрова 30/2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
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
          {ROOM_OPTIONS.map((option) => (
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

      <button type="submit" className="submit-button" disabled={!address.trim() || !countRoom}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        Узнать цену
      </button>
    </form>
  )
}

export default SearchForm

