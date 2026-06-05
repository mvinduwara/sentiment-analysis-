import Sentiment from 'sentiment'
import { getKeywordMap } from './keywordService'
import { detectManipulation } from './manipulationDetector'
import type { AnalysisResult, FoundKeyword, SentimentLabel, KeywordCategory } from '../types'

const sentimentAnalyzer = new Sentiment()


function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function normalize(score: number, wordCount: number): number {
  if (wordCount === 0) return 0
  const maxPossible = wordCount * 5
  return clamp(score / maxPossible, -1, 1)
}

function scoreToLabel(
  score: number,
  normalizedScore: number,
  spamCount: number
): SentimentLabel {
  // Reviews dominated by spam keywords are mixed — they read positive but aren't trustworthy
  if (spamCount >= 2) return 'mixed'
  // Strong clear positive
  if (normalizedScore >= 0.08)  return 'positive'
  // Strong clear negative
  if (normalizedScore <= -0.08) return 'negative'
  // Weak signals either way → mixed
  if (score > 0 && score < 3)   return 'mixed'
  if (score < 0 && score > -3)  return 'mixed'
  return 'neutral'
}


function computeConfidence(
  score: number,
  wordCount: number,
  keywordCount: number,
  label: SentimentLabel
): number {
  if (wordCount === 0) return 0

  const absNorm        = Math.abs(normalize(score, wordCount))
  const keywordDensity = Math.min(keywordCount / Math.max(wordCount, 1), 0.5)
  const extremity      = clamp(absNorm * 2, 0, 1)
  const density        = clamp(keywordDensity * 4, 0, 1)

  let base = (extremity * 0.6 + density * 0.4) * 100

  if (label === 'neutral' || label === 'mixed') base = Math.min(base, 74)

  return Math.round(clamp(base, 10, 97))
}


function getDominantEmotion(score: number, isManipulated: boolean): string {
  if (isManipulated) return 'suspicious'
  if (score >= 15)   return 'enthusiastic'
  if (score >= 7)    return 'satisfied'
  if (score >= 2)    return 'positive'
  if (score >= -1)   return 'neutral'
  if (score >= -5)   return 'disappointed'
  if (score >= -10)  return 'frustrated'
  return 'angry'
}


function buildSummary(
  label: SentimentLabel,
  score: number,
  confidence: number,
  isManipulated: boolean,
  keywordCount: number
): string {
  const parts: string[] = []

  if (isManipulated) {
    parts.push(
      'This review contains patterns associated with inauthentic or manipulated content.'
    )
  }

  const scoreStr = `${score > 0 ? '+' : ''}${score}`

  switch (label) {
    case 'positive':
      parts.push(`The review conveys a clearly positive sentiment (AFINN composite score: ${scoreStr}).`)
      break
    case 'negative':
      parts.push(`The review expresses clearly negative sentiment (AFINN composite score: ${scoreStr}).`)
      break
    case 'mixed':
      parts.push(
        `The review shows mixed sentiment — both positive and negative signals are present (score: ${scoreStr}).`
      )
      break
    case 'neutral':
      parts.push(
        `The review is largely neutral with no strong emotional indicators (score: ${scoreStr}).`
      )
      break
  }

  if (keywordCount > 0) {
    parts.push(
      `${keywordCount} sentiment keyword${keywordCount !== 1 ? 's' : ''} were detected and factored into scoring.`
    )
  }

  parts.push(`Analysis confidence: ${confidence}%.`)

  return parts.join(' ')
}


export function analyzeText(text: string): AnalysisResult {
  const trimmed = text.trim()

  if (!trimmed) {
    return {
      score: 0,
      normalizedScore: 0,
      label: 'neutral',
      confidence: 0,
      isManipulated: false,
      manipulationReasons: [],
      keywords: [],
      wordCount: 0,
      dominantEmotion: 'neutral',
      summary: 'No text provided.',
    }
  }

  const afinnResult    = sentimentAnalyzer.analyze(trimmed)
  let   compositeScore = afinnResult.score
  const wordCount      =
    afinnResult.words.length > 0
      ? afinnResult.words.length
      : trimmed.split(/\s+/).filter(Boolean).length

  const keywordMap     = getKeywordMap()
  const lowerText      = trimmed.toLowerCase()
  const foundKeywords  = new Map<string, FoundKeyword>()

  // Sort by phrase length descending so multi-word phrases match before their sub-words
  const sortedPhrases = Array.from(keywordMap.entries()).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [phrase, data] of sortedPhrases) {
    let searchIdx  = 0
    let occurrences = 0

    while (true) {
      const idx = lowerText.indexOf(phrase, searchIdx)
      if (idx === -1) break
      occurrences++
      searchIdx = idx + 1
    }

    if (occurrences === 0) continue

    const contribution = data.weight * occurrences
    if (data.category === 'positive') compositeScore += contribution * 0.5
    else if (data.category === 'negative') compositeScore -= contribution * 0.5

    const existing = foundKeywords.get(phrase)
    if (existing) {
      existing.occurrences += occurrences
    } else {
      foundKeywords.set(phrase, {
        word: phrase,
        category: data.category as KeywordCategory,
        weight: data.weight,
        occurrences,
      })
    }
  }

  const keywordsArray = Array.from(foundKeywords.values()).sort(
    (a, b) => b.weight * b.occurrences - a.weight * a.occurrences
  )

  const spamCount      = keywordsArray.filter(k => k.category === 'spam').length
  const normalizedScore = normalize(compositeScore, wordCount)
  const label           = scoreToLabel(compositeScore, normalizedScore, spamCount)
  const confidence      = computeConfidence(compositeScore, wordCount, keywordsArray.length, label)

  const { isManipulated, reasons } = detectManipulation(trimmed)

  const dominantEmotion = getDominantEmotion(compositeScore, isManipulated)
  const summary         = buildSummary(label, compositeScore, confidence, isManipulated, keywordsArray.length)

  return {
    score:                Math.round(compositeScore * 10) / 10,
    normalizedScore:      Math.round(normalizedScore * 1000) / 1000,
    label,
    confidence,
    isManipulated,
    manipulationReasons:  reasons,
    keywords:             keywordsArray,
    wordCount,
    dominantEmotion,
    summary,
  }
}