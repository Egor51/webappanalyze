import { useState, useEffect } from 'react'
import { getMandates, deleteMandate, getMandateMatchCount, saveMandate } from '../../utils/mandateStorage'
import MandateForm from './MandateForm'
import './MandatesList.css'

const MandatesList = ({ isPro = false, onSelectMandate, showOnlySelector = false }) => {
  const [mandates, setMandates] = useState([])
  const [editingMandate, setEditingMandate] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadMandates()
  }, [])

  const loadMandates = () => {
    const savedMandates = getMandates()
    setMandates(savedMandates)
  }

  const handleSaveMandate = (mandate) => {
    const result = saveMandate(mandate, isPro)
    
    if (result.success) {
      loadMandates()
      setShowForm(false)
      setEditingMandate(null)
    } else {
      alert(result.error)
    }
  }

  const handleEdit = (mandate) => {
    setEditingMandate(mandate)
    setShowForm(true)
  }

  const handleDelete = (mandateId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот мандат?')) {
      deleteMandate(mandateId)
      loadMandates()
    }
  }

  const handleNewMandate = () => {
    const maxMandates = isPro ? 5 : 1
    if (mandates.length >= maxMandates) {
      alert(isPro 
        ? `Максимум ${maxMandates} мандатов для PRO`
        : `Максимум ${maxMandates} мандат для бесплатного аккаунта. Оформите PRO для большего количества.`
      )
      return
    }
    setEditingMandate(null)
    setShowForm(true)
  }

  const getStrategyLabel = (strategy) => {
    const labels = {
      rent: 'Купить и сдавать',
      flip: 'Флип',
      parking: 'Парковка капитала'
    }
    return labels[strategy] || strategy
  }

  const getStrategyIcon = (strategy) => {
    const icons = {
      rent: '🏠',
      flip: '🔨',
      parking: '💰'
    }
    return icons[strategy] || '📋'
  }

  if (showForm) {
    return (
      <div className="mandates-list">
        <div className="mandates-list-header">
          <button 
            className="mandates-back-button"
            onClick={() => {
              setShowForm(false)
              setEditingMandate(null)
            }}
          >
            ← Назад к списку
          </button>
        </div>
        <MandateForm
          initialData={editingMandate}
          onSave={handleSaveMandate}
          onCancel={() => {
            setShowForm(false)
            setEditingMandate(null)
          }}
          isPro={isPro}
        />
      </div>
    )
  }

  return (
    <div className="mandates-list">
      <div className="mandates-list-header">
        <div>
          <h3>Инвестиционные мандаты</h3>
          <p className="mandates-subtitle">
            Настройте стратегии поиска объектов. Система будет автоматически находить подходящие сделки.
          </p>
        </div>
        <button className="mandates-add-button" onClick={handleNewMandate}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          <span>Создать мандат</span>
        </button>
      </div>

      {mandates.length === 0 ? (
        <div className="mandates-empty">
          <div className="mandates-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h4>Нет мандатов</h4>
          <p>Создайте свой первый инвестиционный мандат, чтобы начать получать персональные предложения</p>
          <button className="mandates-add-button" onClick={handleNewMandate}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            <span>Создать мандат</span>
          </button>
        </div>
      ) : (
        <div className="mandates-grid">
          {mandates.map(mandate => {
            const matchCount = getMandateMatchCount(mandate.id)
            return (
              <div key={mandate.id} className="mandate-card">
                <div className="mandate-card-header">
                  <div className="mandate-card-icon">
                    {getStrategyIcon(mandate.strategy)}
                  </div>
                  <div className="mandate-card-title">
                    <h4>{mandate.name || getStrategyLabel(mandate.strategy)}</h4>
                    <span className="mandate-card-strategy">{getStrategyLabel(mandate.strategy)}</span>
                  </div>
                </div>

                <div className="mandate-card-content">
                  <div className="mandate-card-info">
                    <div className="mandate-info-item">
                      <span className="mandate-info-label">Бюджет:</span>
                      <span className="mandate-info-value">
                        {mandate.budgetMin ? `${(mandate.budgetMin / 1000000).toFixed(1)} млн` : 'Любой'} — 
                        {mandate.budgetMax && mandate.budgetMax !== Infinity 
                          ? ` ${(mandate.budgetMax / 1000000).toFixed(1)} млн` 
                          : ' без ограничений'}
                      </span>
                    </div>
                    {mandate.cities.length > 0 && (
                      <div className="mandate-info-item">
                        <span className="mandate-info-label">Города:</span>
                        <span className="mandate-info-value">{mandate.cities.join(', ')}</span>
                      </div>
                    )}
                    {mandate.targetYield > 0 && (
                      <div className="mandate-info-item">
                        <span className="mandate-info-label">Целевой доход:</span>
                        <span className="mandate-info-value">{mandate.targetYield}% годовых</span>
                      </div>
                    )}
                  </div>

                  <div className="mandate-card-stats">
                    <div className="mandate-stat">
                      <span className="mandate-stat-value">{matchCount}</span>
                      <span className="mandate-stat-label">найдено объектов</span>
                    </div>
                  </div>
                </div>

                <div className="mandate-card-actions">
                  {onSelectMandate && (
                    <button
                      className="mandate-action-button primary"
                      onClick={() => onSelectMandate(mandate)}
                    >
                      Показать сделки
                    </button>
                  )}
                  <button
                    className="mandate-action-button"
                    onClick={() => handleEdit(mandate)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="mandate-action-button danger"
                    onClick={() => handleDelete(mandate.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!isPro && mandates.length >= 1 && (
        <div className="mandates-pro-banner">
          <div className="mandates-pro-content">
            <div>
              <h4>Оформите PRO для большего количества мандатов</h4>
              <p>PRO позволяет создавать до 5 мандатов и получать расширенные возможности</p>
            </div>
            <button className="mandates-pro-button">
              Оформить PRO
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MandatesList

