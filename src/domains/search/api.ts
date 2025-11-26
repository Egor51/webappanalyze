/**
 * Search domain API
 * Все API-запросы для поиска и оценки недвижимости
 */

import { apiClient } from '../../lib/api-client'
import type { PropertyAnalyticsResponse, CitiesAnalyticsResponse, SearchParams } from '../../types/api'

/**
 * Поиск по адресу
 */
export const searchByAddress = async (
  address: string,
  countRoom: string
): Promise<PropertyAnalyticsResponse> => {
  return apiClient.get('/ads/analytic/v1.1', {
    street: address,
    countRoom,
  })
}

/**
 * Поиск по району
 */
export const searchByDistrict = async (
  district: string,
  countRoom?: string,
  houseMaterial?: 'Новостройка' | 'Вторичка'
): Promise<PropertyAnalyticsResponse> => {
  const params: SearchParams = { district }
  
  if (countRoom && countRoom !== 'Весь') {
    params.countRoom = countRoom
  }
  
  if (houseMaterial) {
    params.houseMaterial = houseMaterial
  }
  
  return apiClient.get('/ads/analytic/district', params)
}

/**
 * Поиск по городу
 */
export const searchByCity = async (
  city: string,
  countRoom?: string,
  houseMaterial?: 'Новостройка' | 'Вторичка'
): Promise<PropertyAnalyticsResponse> => {
  const params: SearchParams = { city }
  
  if (countRoom && countRoom !== 'Весь') {
    params.countRoom = countRoom
  }
  
  if (houseMaterial) {
    params.houseMaterial = houseMaterial
  }
  
  return apiClient.get('/ads/analytic/city', params)
}

/**
 * Получить аналитику всех городов
 */
export const getAllCitiesAnalytics = async (
  page: number = 0,
  size: number = 50
): Promise<CitiesAnalyticsResponse> => {
  return apiClient.get('/ads/analytic/city/all', {
    page: page.toString(),
    size: size.toString(),
  })
}

/**
 * Получить предложения адресов (автодополнение)
 */
export const getAddressSuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) {
    return []
  }
  
  return apiClient.get('/ads/address/suggestion', { query })
}

/**
 * Получить предложения городов (автодополнение)
 */
export const getCitySuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) {
    return []
  }
  
  return apiClient.get('/ads/address/city', { query })
}

