import { create } from 'zustand'
import type {
  Review,
  DashboardStats,
  TrendPoint,
  KeywordFrequency,
  Keyword,
  PaginatedReviews,
  FilterSentiment,
  SortBy,
  SortOrder,
  AnalysisResult,
} from '@/types'
import client from '@/api/client'

interface AppStore {
  // Dashboard
  stats: DashboardStats | null
  trend: TrendPoint[]
  topKeywords: KeywordFrequency[]
  loadingDashboard: boolean
  fetchDashboard: () => Promise<void>

  // Analyzer
  analyzing: boolean
  lastResult: AnalysisResult | null
  lastReviewText: string
  analyzeReview: (text: string, source?: string) => Promise<void>
  clearResult: () => void

  // History
  reviews: PaginatedReviews | null
  loadingReviews: boolean
  currentPage: number
  filterSentiment: FilterSentiment
  sortBy: SortBy
  sortOrder: SortOrder
  searchQuery: string
  fetchReviews: (page?: number) => Promise<void>
  setFilter: (filter: FilterSentiment) => void
  setSort: (sortBy: SortBy, sortOrder: SortOrder) => void
  setSearch: (query: string) => void
  deleteReview: (id: number) => Promise<void>

  // Keywords
  keywords: Keyword[]
  loadingKeywords: boolean
  fetchKeywords: () => Promise<void>
  addKeyword: (word: string, category: string, weight: number) => Promise<void>
  updateKeyword: (id: number, word: string, category: string, weight: number) => Promise<void>
  deleteKeyword: (id: number) => Promise<void>

  // Global
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const useAppStore = create<AppStore>((set, get) => ({
  stats: null,
  trend: [],
  topKeywords: [],
  loadingDashboard: false,

  fetchDashboard: async () => {
    set({ loadingDashboard: true })
    try {
      const [statsRes, trendRes, keywordsRes] = await Promise.all([
        client.get('/reviews/stats'),
        client.get('/reviews/trend'),
        client.get('/reviews/keyword-frequency'),
      ])
      set({
        stats: statsRes.data.data,
        trend: trendRes.data.data,
        topKeywords: keywordsRes.data.data,
        loadingDashboard: false,
      })
    } catch {
      set({ loadingDashboard: false })
    }
  },

  analyzing: false,
  lastResult: null,
  lastReviewText: '',

  analyzeReview: async (text: string, source?: string) => {
    set({ analyzing: true })
    try {
      const res = await client.post('/analyze', { text, source })
      set({
        lastResult: res.data.data,
        lastReviewText: text,
        analyzing: false,
      })
      get().addToast({ message: 'Review analyzed successfully', type: 'success' })
    } catch (err) {
      set({ analyzing: false })
      get().addToast({ message: (err as Error).message, type: 'error' })
    }
  },

  clearResult: () => set({ lastResult: null, lastReviewText: '' }),

  reviews: null,
  loadingReviews: false,
  currentPage: 1,
  filterSentiment: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  searchQuery: '',

  fetchReviews: async (page?: number) => {
    const { filterSentiment, sortBy, sortOrder, searchQuery } = get()
    const p = page ?? get().currentPage
    set({ loadingReviews: true, currentPage: p })
    try {
      const params: Record<string, string | number> = {
        page: p,
        limit: 10,
        sortBy,
        sortOrder,
      }
      if (filterSentiment !== 'all') params.filter = filterSentiment
      if (searchQuery) params.search = searchQuery
      const res = await client.get('/reviews', { params })
      set({ reviews: res.data.data, loadingReviews: false })
    } catch {
      set({ loadingReviews: false })
    }
  },

  setFilter: (filter) => {
    set({ filterSentiment: filter, currentPage: 1 })
    get().fetchReviews(1)
  },

  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder, currentPage: 1 })
    get().fetchReviews(1)
  },

  setSearch: (query) => {
    set({ searchQuery: query, currentPage: 1 })
    get().fetchReviews(1)
  },

  deleteReview: async (id: number) => {
    try {
      await client.delete(`/reviews/${id}`)
      get().addToast({ message: 'Review deleted', type: 'success' })
      get().fetchReviews()
    } catch (err) {
      get().addToast({ message: (err as Error).message, type: 'error' })
    }
  },

  keywords: [],
  loadingKeywords: false,

  fetchKeywords: async () => {
    set({ loadingKeywords: true })
    try {
      const res = await client.get('/keywords')
      set({ keywords: res.data.data, loadingKeywords: false })
    } catch {
      set({ loadingKeywords: false })
    }
  },

  addKeyword: async (word, category, weight) => {
    try {
      await client.post('/keywords', { word, category, weight })
      get().addToast({ message: `"${word}" added to ${category} keywords`, type: 'success' })
      get().fetchKeywords()
    } catch (err) {
      get().addToast({ message: (err as Error).message, type: 'error' })
    }
  },

  updateKeyword: async (id, word, category, weight) => {
    try {
      await client.put(`/keywords/${id}`, { word, category, weight })
      get().addToast({ message: 'Keyword updated', type: 'success' })
      get().fetchKeywords()
    } catch (err) {
      get().addToast({ message: (err as Error).message, type: 'error' })
    }
  },

  deleteKeyword: async (id) => {
    try {
      await client.delete(`/keywords/${id}`)
      get().addToast({ message: 'Keyword removed', type: 'success' })
      get().fetchKeywords()
    } catch (err) {
      get().addToast({ message: (err as Error).message, type: 'error' })
    }
  },

  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))