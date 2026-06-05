export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed'
export type KeywordCategory = 'positive' | 'negative' | 'neutral' | 'spam'

export interface FoundKeyword {
  word: string
  category: KeywordCategory
  weight: number
  occurrences: number
}

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

export interface DBKeyword {
  id: number
  word: string
  category: KeywordCategory
  weight: number
  created_at: string
}

export interface DBReview {
  id: number
  text: string
  score: number
  normalized_score: number
  label: SentimentLabel
  confidence: number
  is_manipulated: number
  manipulation_reasons: string
  keywords: string
  word_count: number
  dominant_emotion: string
  summary: string
  source: string | null
  created_at: string
}