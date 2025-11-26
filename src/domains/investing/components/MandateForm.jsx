import { useState } from 'react'
import './MandateForm.css'

const STRATEGY_TYPES = [
  { value: 'rent', label: 'Купить и сдавать', icon: '🏠' },
  { value: 'flip', label: 'Флип (купить-ремонт-продать)', icon: '🔨' },
  { value: 'parking', label: 'Парковка капитала', icon: '💰' },
]

const CITIES = [
  'Мурманск', 'Оленегорск', 'Апатиты', 'Кировск', 'Мончегорск',
  'Полярные Зори', 'Полярный', 'Североморск', 'Заозерск', 'Снежногорск',
  'Кандалакша', 'Кола'
]

const DISTRICTS = [
  'Октябрьский', 'Первомайский', 'Ленинский'
]

const PROPERTY_TYPES = [
  { value: 'all', label: 'Все' },
  { value: 'panel', label: 'Панель' },
  { value: 'monolith', label: 'Монолит' },
  { value: 'brick', label: 'Кирпич' },
  { value: 'block', label: 'Блочный' },
]

const MandateForm = ({ onSave, onCancel, initialData = null, isPro = false }) => {
  const [name, setName] = useState(initialData?.name || '')
  const [budgetMin, setBudgetMin] = useState(initialData?.budgetMin || '')
  const [budgetMax, setBudgetMax] = useState(initialData?.budgetMax || '')
  const [strategy, setStrategy] = useState(initialData?.strategy || 'rent')
  const [selectedCities, setSelectedCities] = useState(initialData?.cities || [])
  const [selectedDistricts, setSelectedDistricts] = useState(initialData?.districts || [])
  const [propertyTypes, setPropertyTypes] = useState(initialData?.propertyTypes || ['all'])
  const [targetYield, setTargetYield] = useState(initialData?.targetYield || '')
  const [maxRisk, setMaxRisk] = useState(initialData?.maxRisk || 'low')
  const [excludeOldBuildings, setExcludeOldBuildings] = useState(initialData?.excludeOldBuildings || false)

  const handleCityToggle = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  const handleDistrictToggle = (district) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    )
  }

  const handlePropertyTypeToggle = (type) => {
    if (type === 'all') {
      setPropertyTypes(['all'])
    } else {
      setPropertyTypes(prev => {
        const filtered = prev.filter(t => t !== 'all')
        return prev.includes(type)
          ? filtered.filter(t => t !== type)
          : [...filtered, type]
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const mandate = {
      name: name || `Мандат ${strategy}`,
      budgetMin: parseFloat(budgetMin) || 0,
      budgetMax: parseFloat(budgetMax) || Infinity,
      strategy,
      cities: selectedCities,
      districts: selectedDistricts,
      propertyTypes: propertyTypes.includes('all') ? [] : propertyTypes,
      targetYield: parseFloat(targetYield) || 0,
      maxRisk,
      excludeOldBuildings,
      createdAt: initialData?.createdAt || Date.now(),
      id: initialData?.id || Date.now().toString(),
    }

    onSave(mandate)
  }

  return (
    <form className="mandate-form" onSubmit={handleSubmit}>
      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Название мандата (опционально)
        </label>
        <input
          type="text"
          className="mandate-form-input"
          placeholder="Например: Флип в центре"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Бюджет (₽)
        </label>
        <div className="mandate-form-budget">
          <input
            type="number"
            className="mandate-form-input"
            placeholder="От"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            min="0"
            step="100000"
          />
          <span className="mandate-form-separator">—</span>
          <input
            type="number"
            className="mandate-form-input"
            placeholder="До"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            min="0"
            step="100000"
          />
        </div>
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Стратегия
        </label>
        <div className="mandate-form-strategies">
          {STRATEGY_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              className={`mandate-form-strategy ${strategy === type.value ? 'active' : ''}`}
              onClick={() => setStrategy(type.value)}
            >
              <span className="strategy-icon">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Города
        </label>
        <div className="mandate-form-chips">
          {CITIES.map(city => (
            <button
              key={city}
              type="button"
              className={`mandate-form-chip ${selectedCities.includes(city) ? 'active' : ''}`}
              onClick={() => handleCityToggle(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {selectedCities.includes('Мурманск') && (
        <div className="mandate-form-section">
          <label className="mandate-form-label">
            Районы Мурманска
          </label>
          <div className="mandate-form-chips">
            {DISTRICTS.map(district => (
              <button
                key={district}
                type="button"
                className={`mandate-form-chip ${selectedDistricts.includes(district) ? 'active' : ''}`}
                onClick={() => handleDistrictToggle(district)}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Типы объектов
        </label>
        <div className="mandate-form-chips">
          {PROPERTY_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              className={`mandate-form-chip ${propertyTypes.includes(type.value) ? 'active' : ''}`}
              onClick={() => handlePropertyTypeToggle(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Целевой доход (% годовых)
        </label>
        <input
          type="number"
          className="mandate-form-input"
          placeholder="Например: 12"
          value={targetYield}
          onChange={(e) => setTargetYield(e.target.value)}
          min="0"
          max="100"
          step="0.1"
        />
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-label">
          Максимальный риск
        </label>
        <div className="mandate-form-radio">
          <label className="mandate-form-radio-item">
            <input
              type="radio"
              name="maxRisk"
              value="low"
              checked={maxRisk === 'low'}
              onChange={(e) => setMaxRisk(e.target.value)}
            />
            <span>Низкий (только новые/качественные дома)</span>
          </label>
          <label className="mandate-form-radio-item">
            <input
              type="radio"
              name="maxRisk"
              value="medium"
              checked={maxRisk === 'medium'}
              onChange={(e) => setMaxRisk(e.target.value)}
            />
            <span>Средний</span>
          </label>
          <label className="mandate-form-radio-item">
            <input
              type="radio"
              name="maxRisk"
              value="high"
              checked={maxRisk === 'high'}
              onChange={(e) => setMaxRisk(e.target.value)}
            />
            <span>Высокий (все варианты)</span>
          </label>
        </div>
      </div>

      <div className="mandate-form-section">
        <label className="mandate-form-checkbox">
          <input
            type="checkbox"
            checked={excludeOldBuildings}
            onChange={(e) => setExcludeOldBuildings(e.target.checked)}
          />
          <span>Исключить старые дома (старше 30 лет)</span>
        </label>
      </div>

      <div className="mandate-form-actions">
        <button type="button" className="mandate-form-cancel" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="mandate-form-submit">
          {initialData ? 'Сохранить изменения' : 'Создать мандат'}
        </button>
      </div>
    </form>
  )
}

export default MandateForm

