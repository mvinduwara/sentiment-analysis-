export interface ManipulationCheck {
  isManipulated: boolean
  reasons: string[]
}

const SPAM_PHRASES: string[] = [
  'buy now',
  'buy this now',
  'everyone should buy',
  'told all my friends',
  'changed my life',
  'must buy',
  'best purchase ever',
  'life changing',
  'miracle product',
  'act now',
  'limited time',
  'dont miss out',
  "don't miss out",
  'click here',
  'order now',
  'once in a lifetime',
  'you will not regret',
  "you won't regret",
]

const EXCESSIVE_CAPS_RATIO      = 0.35
const EXCESSIVE_EXCLAMATION_MIN = 4
const REPETITION_RATIO          = 0.25
const REPETITION_MIN_COUNT      = 3
const MIN_WORDS_FOR_CHECKS      = 6

export function detectManipulation(text: string): ManipulationCheck {
  const reasons: string[] = []
  const words    = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const lower    = text.toLowerCase()

  const longWords  = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 4)
  if (longWords.length > 0) {
    const capsWords  = longWords.filter(w => /[A-Z]/.test(w) && w.replace(/[^a-zA-Z]/g, '') === w.replace(/[^a-zA-Z]/g, '').toUpperCase())
    const capsRatio  = capsWords.length / longWords.length
    if (capsRatio >= EXCESSIVE_CAPS_RATIO && capsWords.length >= 3) {
      reasons.push(
        `Excessive capitalization: ${Math.round(capsRatio * 100)}% of words are ALL CAPS (${capsWords.length} words)`
      )
    }
  }


  const exclamationCount = (text.match(/!/g) ?? []).length
  if (exclamationCount >= EXCESSIVE_EXCLAMATION_MIN) {
    reasons.push(
      `Excessive punctuation: ${exclamationCount} exclamation mark${exclamationCount > 1 ? 's' : ''} detected`
    )
  }

  if (wordCount >= MIN_WORDS_FOR_CHECKS) {
    const freq: Record<string, number> = {}
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '')
      if (clean.length >= 4) freq[clean] = (freq[clean] ?? 0) + 1
    }
    const entries  = Object.entries(freq)
    if (entries.length > 0) {
      const [topWord, topCount] = entries.sort((a, b) => b[1] - a[1])[0]
      if (
        topCount >= REPETITION_MIN_COUNT &&
        topCount / wordCount >= REPETITION_RATIO
      ) {
        reasons.push(
          `Repetitive content: "${topWord}" appears ${topCount} times (${Math.round((topCount / wordCount) * 100)}% of all words)`
        )
      }
    }
  }

  const hitPhrases = SPAM_PHRASES.filter(p => lower.includes(p))
  if (hitPhrases.length > 0) {
    reasons.push(
      `Spam language detected: "${hitPhrases.slice(0, 2).join('", "')}"`
    )
  }

  if (
    wordCount <= 5 &&
    /\b(perfect|amazing|best|excellent|love|great|fantastic|wonderful)\b/i.test(text)
  ) {
    reasons.push(
      'Suspiciously brief yet extremely positive — no product-specific detail provided'
    )
  }

  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 10)

  if (sentences.length >= 3) {
    const unique = new Set(sentences)
    if (unique.size / sentences.length < 0.6) {
      reasons.push(
        'Repeated sentence fragments detected — consistent with copy-paste or bot-generated content'
      )
    }
  }

  if (/(.)\1{4,}/.test(text)) {
    reasons.push(
      'Character repetition pattern detected (e.g. "aaaa", "!!!!") — common in inauthentic reviews'
    )
  }

  const SENTIMENT_WORDS = /\b(amazing|perfect|best|excellent|wonderful|fantastic|great|outstanding)\b/i
  const PRODUCT_WORDS   = /\b(product|item|service|quality|delivery|shipping|packaging|size|color|price|staff|support|material|design|feature|battery|screen|fit|flavor|smell|texture|sound|weight|durability)\b/i
  if (
    wordCount >= 40 &&
    SENTIMENT_WORDS.test(text) &&
    !PRODUCT_WORDS.test(text)
  ) {
    reasons.push(
      'Long positive review with no product-specific language — pattern typical of fake or incentivised reviews'
    )
  }

  const superlatives = (text.match(/\b(best|greatest|perfect|most amazing|most incredible|most wonderful|number one|number 1|unbelievable|unbeatable|flawless|impeccable)\b/gi) ?? [])
  if (superlatives.length >= 4) {
    reasons.push(
      `Superlative overuse: ${superlatives.length} extreme superlatives in a single review`
    )
  }

  return {
    isManipulated: reasons.length >= 2,
    reasons,
  }
}