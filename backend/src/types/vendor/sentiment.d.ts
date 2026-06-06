declare module 'sentiment' {
  interface SentimentResult {
    score: number
    comparative: number
    words: string[]
    positive: string[]
    negative: string[]
    tokens: string[]
    calculation: Array<Record<string, number>>
  }

  interface SentimentOptions {
    extras?: Record<string, number>
    language?: string
  }

  interface LanguageType {
    labels: Record<string, number>
  }

  class Sentiment {
    analyze(phrase: string, options?: SentimentOptions): SentimentResult
    registerLanguage(languageCode: string, language: LanguageType): void
  }

  export = Sentiment
}