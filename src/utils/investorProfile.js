// Утилиты для работы с профилем инвестора

const PROFILE_KEY = 'investor_profile'
const SAVED_DEALS_KEY = 'investor_saved_deals'
const DEAL_TRACKS_KEY = 'investor_deal_tracks'

/**
 * Получает профиль инвестора
 * @returns {Object}
 */
export const getInvestorProfile = () => {
  try {
    const profile = localStorage.getItem(PROFILE_KEY)
    return profile ? JSON.parse(profile) : {
      totalDeals: 0,
      activeDeals: 0,
      totalInvested: 0,
      totalReturn: 0,
      averageYield: 0,
      createdAt: Date.now()
    }
  } catch (error) {
    console.error('Ошибка при получении профиля:', error)
    return null
  }
}

/**
 * Сохраняет профиль инвестора
 * @param {Object} profile - Профиль инвестора
 */
export const saveInvestorProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.error('Ошибка при сохранении профиля:', error)
  }
}

/**
 * Получает сохраненные сделки
 * @returns {Array}
 */
export const getSavedDeals = () => {
  try {
    const deals = localStorage.getItem(SAVED_DEALS_KEY)
    return deals ? JSON.parse(deals) : []
  } catch (error) {
    console.error('Ошибка при получении сохраненных сделок:', error)
    return []
  }
}

/**
 * Сохраняет сделку
 * @param {Object} deal - Объект сделки
 */
export const saveDeal = (deal) => {
  try {
    const deals = getSavedDeals()
    const existingIndex = deals.findIndex(d => d.id === deal.id)
    
    if (existingIndex >= 0) {
      deals[existingIndex] = deal
    } else {
      deals.push({
        ...deal,
        savedAt: Date.now()
      })
    }
    
    localStorage.setItem(SAVED_DEALS_KEY, JSON.stringify(deals))
    return true
  } catch (error) {
    console.error('Ошибка при сохранении сделки:', error)
    return false
  }
}

/**
 * Удаляет сохраненную сделку
 * @param {string} dealId - ID сделки
 */
export const removeSavedDeal = (dealId) => {
  try {
    const deals = getSavedDeals()
    const filtered = deals.filter(d => d.id !== dealId)
    localStorage.setItem(SAVED_DEALS_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Ошибка при удалении сделки:', error)
    return false
  }
}

/**
 * Получает треки сделок
 * @returns {Array}
 */
export const getDealTracks = () => {
  try {
    const tracks = localStorage.getItem(DEAL_TRACKS_KEY)
    return tracks ? JSON.parse(tracks) : []
  } catch (error) {
    console.error('Ошибка при получении треков:', error)
    return []
  }
}

/**
 * Сохраняет трек сделки
 * @param {Object} track - Трек сделки
 */
export const saveDealTrack = (track) => {
  try {
    const tracks = getDealTracks()
    const existingIndex = tracks.findIndex(t => t.dealId === track.dealId)
    
    const trackData = {
      dealId: track.dealId,
      status: track.status, // 'idea', 'negotiation', 'purchase', 'renovation', 'renting', 'sold'
      notes: track.notes || '',
      updatedAt: Date.now(),
      createdAt: track.createdAt || Date.now()
    }
    
    if (existingIndex >= 0) {
      tracks[existingIndex] = trackData
    } else {
      tracks.push(trackData)
    }
    
    localStorage.setItem(DEAL_TRACKS_KEY, JSON.stringify(tracks))
    return true
  } catch (error) {
    console.error('Ошибка при сохранении трека:', error)
    return false
  }
}

/**
 * Получает статистику по профилю
 * @returns {Object}
 */
export const getProfileStats = () => {
  const profile = getInvestorProfile()
  const savedDeals = getSavedDeals()
  const tracks = getDealTracks()
  
  const statusCounts = {
    idea: 0,
    negotiation: 0,
    purchase: 0,
    renovation: 0,
    renting: 0,
    sold: 0
  }
  
  tracks.forEach(track => {
    if (statusCounts.hasOwnProperty(track.status)) {
      statusCounts[track.status]++
    }
  })
  
  return {
    ...profile,
    savedDealsCount: savedDeals.length,
    tracksCount: tracks.length,
    statusCounts
  }
}

