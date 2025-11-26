/**
 * React Query (TanStack Query) настройка
 * Централизованная конфигурация для data-layer
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Настройка QueryClient с оптимальными дефолтами
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: данные считаются свежими 5 минут
      staleTime: 5 * 60 * 1000, // 5 минут
      
      // Кэш хранится 10 минут
      gcTime: 10 * 60 * 1000, // 10 минут (было cacheTime)
      
      // Retry логика
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Refetch при фокусе окна
      refetchOnWindowFocus: true,
      
      // Refetch при переподключении
      refetchOnReconnect: true,
      
      // Не refetch при монтировании, если данные свежие
      refetchOnMount: true,
    },
    mutations: {
      // Retry для мутаций (обычно не нужно, но можно настроить)
      retry: 1,
    },
  },
})

/**
 * Query keys factory для типобезопасных ключей
 * Используется для создания уникальных ключей запросов
 */
export const queryKeys = {
  // Search domain
  search: {
    all: ['search'] as const,
    byAddress: (address: string, countRoom: string) => 
      ['search', 'address', address, countRoom] as const,
    byDistrict: (district: string, countRoom?: string, houseMaterial?: string) => 
      ['search', 'district', district, countRoom, houseMaterial] as const,
    byCity: (city: string, countRoom?: string, houseMaterial?: string) => 
      ['search', 'city', city, countRoom, houseMaterial] as const,
    allCities: (page?: number, size?: number) => 
      ['search', 'all-cities', page, size] as const,
  },
  
  // Investing domain
  investing: {
    all: ['investing'] as const,
    top: () => ['investing', 'top'] as const,
    byBudget: (budget: number) => ['investing', 'by-budget', budget] as const,
    byMandate: (mandateId: string | number) => ['investing', 'by-mandate', mandateId] as const,
    detail: (id: string | number) => ['investing', 'detail', id] as const,
  },
  
  // Urgent Sale domain
  urgentSale: {
    all: ['urgent-sale'] as const,
    applications: () => ['urgent-sale', 'applications'] as const,
  },
  
  // Auth domain
  auth: {
    all: ['auth'] as const,
    investing: () => ['auth', 'investing'] as const,
  },
  
  // Analytics domain
  analytics: {
    all: ['analytics'] as const,
    events: () => ['analytics', 'events'] as const,
  },
  
  // Address suggestions
  suggestions: {
    addresses: (query: string) => ['suggestions', 'addresses', query] as const,
    cities: (query: string) => ['suggestions', 'cities', query] as const,
  },
} as const

