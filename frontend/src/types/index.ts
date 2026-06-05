export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed'
export type KeywordCategory = 'positive' | 'negative' | 'neutral' | 'spam'

export interface AnalysisResult {
  score: number
  normalizedScore: number
  label: SentimentLabel
  confidence: number
  isManipulated: boolean
  manipulationReasons: string[]
  keywords: FoundKeyword[]
  wordCount: number
  dominantEmotion: string
  summary: string
}

export interface FoundKeyword {
  word: string
  category: KeywordCategory
  weight: number
  occurrences: number
}

export interface Review {
  id: number
  text: string
  score: number
  normalizedScore: number
  label: SentimentLabel
  confidence: number
  isManipulated: boolean
  manipulationReasons: string[]
  keywords: FoundKeyword[]
  wordCount: number
  dominantEmotion: string
  summary: string
  createdAt: string
  source?: string
}

export interface Keyword {
  id: number
  word: string
  category: KeywordCategory
  weight: number
  createdAt: string
}

export interface DashboardStats {
  totalReviews: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  mixedCount: number
  manipulatedCount: number
  averageScore: number
  averageConfidence: number
}

export interface TrendPoint {
  date: string
  positive: number
  negative: number
  neutral: number
  mixed: number
  avgScore: number
}

export interface KeywordFrequency {
  word: string
  count: number
  category: KeywordCategory
}

export interface PaginatedReviews {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export type FilterSentiment = 'all' | SentimentLabel | 'manipulated'
export type SortOrder = 'desc' | 'asc'
export type SortBy = 'createdAt' | 'score' | 'confidence'