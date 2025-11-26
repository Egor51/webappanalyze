import { useState } from 'react'
import './CheckupModal.css'

const CHECKUP_TYPES = [
  {
    id: 'object',
    title: 'Проверка объекта',
    price: 1990,
    description: 'Проверка документов, рисков, планировки объекта'
  },
  {
    id: 'district',
    title: 'Проверка района',
    price: 1490,
    description: 'Инфраструктура, аренда, криминогенность района'
  },
  {
    id: 'full',
    title: 'Полный Checkup',
    price: 2990,
    description: 'Проверка объекта + района + финансовая модель',
    popular: true
  }
]

const CheckupModal = ({ option, isPro = false, onClose, onPurchase }) => {
  const [selectedType, setSelectedType] = useState('full')
  const [discount, setDiscount] = useState(isPro ? 0.1 : 0) // 10% скидка для PRO

  const selectedCheckup = CHECKUP_TYPES.find(t => t.id === selectedType)
  const finalPrice = selectedCheckup ? Math.round(selectedCheckup.price * (1 - discount)) : 0

  const handlePurchase = () => {
    // TODO: Интеграция с платежной системой
    console.log('Покупка Checkup:', {
      type: selectedType,
      price: finalPrice,
      objectId: option.url || option.fullAddress
    })
    onPurchase()
  }

  return (
    <div className="checkup-modal-overlay" onClick={onClose}>
      <div className="checkup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkup-modal-close" onClick={onClose}>×</button>
        
        <div className="checkup-modal-content">
          <div className="checkup-modal-header">
            <h3>Инвест-Checkup</h3>
            <p>Получите детальный анализ объекта от экспертов</p>
          </div>

          <div className="checkup-object-info">
            <h4>{option.fullAddress || 'Адрес не указан'}</h4>
            {option.price && (
              <p className="checkup-object-price">
                {typeof option.price === 'number' ? `${(option.price / 1000000).toFixed(1)} млн ₽` : option.price}
              </p>
            )}
          </div>

          <div className="checkup-types">
            {CHECKUP_TYPES.map(type => (
              <div
                key={type.id}
                className={`checkup-type-card ${selectedType === type.id ? 'active' : ''} ${type.popular ? 'popular' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                {type.popular && (
                  <div className="checkup-popular-badge">Популярный</div>
                )}
                <div className="checkup-type-header">
                  <h4>{type.title}</h4>
                  <div className="checkup-type-price">
                    {type.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <p className="checkup-type-description">{type.description}</p>
                {isPro && (
                  <div className="checkup-pro-discount">
                    <span>Скидка PRO: -10%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {discount > 0 && (
            <div className="checkup-discount-info">
              <span>Скидка PRO применена</span>
            </div>
          )}

          <div className="checkup-total">
            <div className="checkup-total-label">Итого:</div>
            <div className="checkup-total-price">{finalPrice.toLocaleString('ru-RU')} ₽</div>
          </div>

          <div className="checkup-form-actions">
            <button className="checkup-cancel" onClick={onClose}>
              Отмена
            </button>
            <button className="checkup-purchase" onClick={handlePurchase}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Оформить за {finalPrice.toLocaleString('ru-RU')} ₽</span>
            </button>
          </div>

          <div className="checkup-guarantee">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <span>Гарантия возврата средств в течение 7 дней</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckupModal

