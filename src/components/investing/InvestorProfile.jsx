import { useState, useEffect } from 'react'
import { getProfileStats, getSavedDeals, getDealTracks, saveDealTrack, removeSavedDeal } from '../../utils/investorProfile'
import { getMandates } from '../../utils/mandateStorage'
import './InvestorProfile.css'

const STATUS_LABELS = {
  idea: 'Идея',
  negotiation: 'В переговорах',
  purchase: 'Покупка',
  renovation: 'Ремонт',
  renting: 'Сдаётся',
  sold: 'Продан'
}

const STATUS_COLORS = {
  idea: '#64748b',
  negotiation: '#f59e0b',
  purchase: '#3b82f6',
  renovation: '#8b5cf6',
  renting: '#10b981',
  sold: '#ef4444'
}

const InvestorProfile = ({ isPro = false }) => {
  const [stats, setStats] = useState(null)
  const [savedDeals, setSavedDeals] = useState([])
  const [tracks, setTracks] = useState([])
  const [mandates, setMandates] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'deals', 'tracks'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const profileStats = getProfileStats()
    const deals = getSavedDeals()
    const dealTracks = getDealTracks()
    const savedMandates = getMandates()
    
    setStats(profileStats)
    setSavedDeals(deals)
    setTracks(dealTracks)
    setMandates(savedMandates)
  }

  const handleStatusChange = (dealId, newStatus) => {
    saveDealTrack({
      dealId,
      status: newStatus
    })
    loadData()
  }

  const handleRemoveDeal = (dealId) => {
    if (window.confirm('Удалить сделку из сохраненных?')) {
      removeSavedDeal(dealId)
      loadData()
    }
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return '—'
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₽`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }

  if (!stats) {
    return (
      <div className="investor-profile">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="investor-profile">
      <div className="profile-header">
        <div>
          <h3>Профиль инвестора</h3>
          <p className="profile-subtitle">Ваша статистика и треки сделок</p>
        </div>
        {!isPro && (
          <div className="profile-pro-badge">
            <span>FREE</span>
          </div>
        )}
      </div>

      {!isPro && (
        <div className="profile-pro-banner">
          <div>
            <h4>Оформите PRO для расширенной аналитики</h4>
            <p>Экспорт отчетов, рекомендации по ребалансировке, приватная статистика</p>
          </div>
          <button className="profile-pro-button">Оформить PRO</button>
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button
          className={`profile-tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          Сохраненные ({savedDeals.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          Треки ({tracks.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="profile-overview">
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.savedDealsCount}</div>
                <div className="stat-label">Сохраненных сделок</div>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{mandates.length}</div>
                <div className="stat-label">Активных мандатов</div>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{stats.statusCounts.purchase + stats.statusCounts.renovation + stats.statusCounts.renting}</div>
                <div className="stat-label">Активных сделок</div>
              </div>
            </div>

            <div className="profile-stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.statusCounts.sold}</div>
                <div className="stat-label">Завершенных сделок</div>
              </div>
            </div>
          </div>

          <div className="profile-status-breakdown">
            <h4>Статусы сделок</h4>
            <div className="status-breakdown-list">
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const count = stats.statusCounts[key] || 0
                if (count === 0) return null
                return (
                  <div key={key} className="status-breakdown-item">
                    <div className="status-indicator" style={{ backgroundColor: STATUS_COLORS[key] }}></div>
                    <span className="status-label">{label}</span>
                    <span className="status-count">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {mandates.length > 0 && (
            <div className="profile-mandates-summary">
              <h4>Мандаты</h4>
              <div className="mandates-summary-list">
                {mandates.map(mandate => (
                  <div key={mandate.id} className="mandate-summary-item">
                    <span className="mandate-name">{mandate.name || 'Мандат'}</span>
                    <span className="mandate-strategy">{mandate.strategy === 'rent' ? 'Аренда' : mandate.strategy === 'flip' ? 'Флип' : 'Парковка'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="profile-deals">
          {savedDeals.length === 0 ? (
            <div className="profile-empty">
              <p>Нет сохраненных сделок</p>
              <p className="empty-hint">Сохраняйте интересные объекты из раздела "Сделки"</p>
            </div>
          ) : (
            <div className="saved-deals-list">
              {savedDeals.map(deal => {
                const track = tracks.find(t => t.dealId === deal.id)
                return (
                  <div key={deal.id} className="saved-deal-card">
                    <div className="saved-deal-header">
                      <div className="saved-deal-title-section">
                        <h4 onClick={() => {
                          // TODO: Открыть детальный просмотр объекта
                          if (deal.url) {
                            window.open(deal.url, '_blank')
                          }
                        }}>{deal.fullAddress || 'Адрес не указан'}</h4>
                        {deal.differencePercent !== null && deal.differencePercent !== undefined && (
                          <div className={`saved-deal-difference ${deal.differencePercent < 0 ? 'positive' : 'negative'}`}>
                            {deal.differencePercent > 0 ? '+' : ''}{deal.differencePercent.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <button
                        className="saved-deal-remove"
                        onClick={() => handleRemoveDeal(deal.id)}
                        title="Удалить из сохраненных"
                      >
                        ×
                      </button>
                    </div>
                    <div className="saved-deal-info">
                      {deal.price && (
                        <div className="saved-deal-info-item">
                          <span className="saved-deal-label">Цена:</span>
                          <span className="saved-deal-price">{formatPrice(deal.price)}</span>
                        </div>
                      )}
                      {deal.square && (
                        <div className="saved-deal-info-item">
                          <span className="saved-deal-label">Площадь:</span>
                          <span className="saved-deal-square">{deal.square} м²</span>
                        </div>
                      )}
                      {deal.countRoom && (
                        <div className="saved-deal-info-item">
                          <span className="saved-deal-label">Комнат:</span>
                          <span className="saved-deal-rooms">{deal.countRoom}</span>
                        </div>
                      )}
                    </div>
                    {track && (
                      <div className="saved-deal-status">
                        <label className="saved-deal-status-label">Статус сделки:</label>
                        <select
                          value={track.status}
                          onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                          className="status-select"
                          style={{ borderColor: STATUS_COLORS[track.status] }}
                        >
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {!track && (
                      <div className="saved-deal-status">
                        <button
                          className="saved-deal-add-status"
                          onClick={() => handleStatusChange(deal.id, 'idea')}
                        >
                          Добавить статус
                        </button>
                      </div>
                    )}
                    {deal.url && (
                      <div className="saved-deal-actions">
                        <a
                          href={deal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="saved-deal-link"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          <span>Открыть объявление</span>
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="profile-tracks">
          {tracks.length === 0 ? (
            <div className="profile-empty">
              <p>Нет треков сделок</p>
              <p className="empty-hint">Обновляйте статусы сохраненных сделок</p>
            </div>
          ) : (
            <div className="tracks-list">
              {tracks.map(track => {
                const deal = savedDeals.find(d => d.id === track.dealId)
                return (
                  <div key={track.dealId} className="track-card">
                    <div className="track-header">
                      <div className="track-status-badge" style={{ backgroundColor: STATUS_COLORS[track.status] }}>
                        {STATUS_LABELS[track.status]}
                      </div>
                      <span className="track-date">
                        {new Date(track.updatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {deal && (
                      <div className="track-deal-info">
                        <h4>{deal.fullAddress || 'Адрес не указан'}</h4>
                        {deal.price && (
                          <span className="track-price">{formatPrice(deal.price)}</span>
                        )}
                      </div>
                    )}
                    {track.notes && (
                      <div className="track-notes">
                        <p>{track.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InvestorProfile

