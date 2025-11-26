import { useState } from 'react'
import { createTradeIdea } from '../../../shared/utils/tradeIdeaCalculator'
import { saveDeal, getSavedDeals } from '../../../shared/utils/investorProfile'
import './TradeIdeaCard.css'

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

const formatNumber = (num) => {
  if (num === null || num === undefined) {
return '—'
}
  return num.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}

const TradeIdeaCard = ({ option, mandate = null, isPro = false, onClick }) => {
  const tradeIdea = createTradeIdea(option, mandate)
  const { potential, risks } = tradeIdea
  
  const dealId = option.url || `${option.fullAddress}-${option.price}`
  const savedDeals = getSavedDeals()
  const [isSaved, setIsSaved] = useState(savedDeals.some(d => d.id === dealId))

  const handleSave = (e) => {
    e.stopPropagation()
    const saved = saveDeal({
      id: dealId,
      ...option
    })
    if (saved) {
      setIsSaved(true)
    }
  }

  const renderStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < level ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ))
  }

  const getPotentialBadge = () => {
    if (potential.marketDifference < -10) {
      return { text: `Ниже рынка на ${Math.abs(potential.marketDifference).toFixed(1)}%`, class: 'positive' }
    } else if (potential.marketDifference > 10) {
      return { text: `Выше рынка на ${potential.marketDifference.toFixed(1)}%`, class: 'negative' }
    }
    return null
  }

  const potentialBadge = getPotentialBadge()

  return (
    <div className="trade-idea-card" onClick={onClick}>
      <div className="trade-idea-header">
        <div className="trade-idea-title-section">
          <h3 className="trade-idea-address">{option.fullAddress || 'Адрес не указан'}</h3>
          {potentialBadge && (
            <div className={`trade-idea-badge ${potentialBadge.class}`}>
              {potentialBadge.text}
            </div>
          )}
        </div>
        <div className="trade-idea-interest">
          <div className="trade-idea-stars">
            {renderStars(potential.interestLevel)}
          </div>
          <span className="trade-idea-level-text">{potential.interestLevel}/5</span>
        </div>
      </div>

      <div className="trade-idea-details">
        {option.square && (
          <div className="trade-idea-detail">
            <span className="detail-label">Площадь:</span>
            <span className="detail-value">{option.square} м²</span>
          </div>
        )}
        {option.countRoom && (
          <div className="trade-idea-detail">
            <span className="detail-label">Комнат:</span>
            <span className="detail-value">{option.countRoom}</span>
          </div>
        )}
        {option.price && (
          <div className="trade-idea-detail">
            <span className="detail-label">Цена:</span>
            <span className="detail-value">{formatPrice(option.price)}</span>
          </div>
        )}
      </div>

      {/* Потенциал - показываем только для PRO или базовую информацию для FREE */}
      <div className="trade-idea-potential">
        {isPro ? (
          <>
            {potential.strategy === 'flip' && potential.flipMargin && (
              <div className="potential-item">
                <span className="potential-label">Потенциал флипа:</span>
                <span className="potential-value positive">
                  {formatPrice(potential.flipMargin)} ({formatNumber(potential.flipMarginPercent)}%)
                </span>
              </div>
            )}
            {potential.strategy === 'rent' && potential.rentalYield && (
              <div className="potential-item">
                <span className="potential-label">Доходность:</span>
                <span className="potential-value positive">
                  {formatNumber(potential.rentalYield)}% годовых
                </span>
              </div>
            )}
            {potential.monthlyRent && (
              <div className="potential-item">
                <span className="potential-label">Аренда:</span>
                <span className="potential-value">
                  ~{formatPrice(potential.monthlyRent)}/мес
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="potential-free">
            <span>Уровень интереса: {potential.interestLevel}/5</span>
            <button 
              className="potential-unlock-button"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: открыть модальное окно PRO или платной модели
              }}
            >
              Открыть модель →
            </button>
          </div>
        )}
      </div>

      {/* Риски - показываем только для PRO */}
      {isPro && risks.length > 0 && (
        <div className="trade-idea-risks">
          <div className="risks-title">Риски:</div>
          <div className="risks-list">
            {risks.map((risk, index) => (
              <div key={index} className={`risk-item risk-${risk.severity}`}>
                <span className="risk-icon">
                  {risk.severity === 'high' ? '⚠️' : risk.severity === 'medium' ? '⚡' : 'ℹ️'}
                </span>
                <span className="risk-message">{risk.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="trade-idea-actions">
        <button
          className="trade-idea-save-button"
          onClick={handleSave}
          title={isSaved ? 'Сохранено' : 'Сохранить сделку'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isSaved ? (
              <polyline points="20 6 9 17 4 12"></polyline>
            ) : (
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            )}
          </svg>
          <span>{isSaved ? 'Сохранено' : 'Сохранить'}</span>
        </button>

        {!isPro && (
          <button 
            className="trade-idea-unlock-button"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: открыть модальное окно PRO или платной модели
            }}
          >
            <span>Полная модель</span>
            <span className="unlock-price">199 ₽</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default TradeIdeaCard

