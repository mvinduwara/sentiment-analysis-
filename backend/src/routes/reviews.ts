import { Router, Request, Response } from 'express'
import db from '../db/database'
import type { DBReview } from '../types'

const router = Router()


function mapReview(row: DBReview) {
  return {
    id:                  row.id,
    text:                row.text,
    score:               row.score,
    normalizedScore:     row.normalized_score,
    label:               row.label,
    confidence:          row.confidence,
    isManipulated:       row.is_manipulated === 1,
    manipulationReasons: JSON.parse(row.manipulation_reasons || '[]') as string[],
    keywords:            JSON.parse(row.keywords || '[]'),
    wordCount:           row.word_count,
    dominantEmotion:     row.dominant_emotion,
    summary:             row.summary,
    source:              row.source,
    createdAt:           row.created_at,
  }
}


router.get('/', (req: Request, res: Response) => {
  const page      = Math.max(1, parseInt(req.query.page   as string) || 1)
  const limit     = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10))
  const offset    = (page - 1) * limit
  const filter    = (req.query.filter    as string) || ''
  const search    = (req.query.search    as string) || ''
  const sortByRaw = (req.query.sortBy    as string) || 'createdAt'
  const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC'

  const SORT_MAP: Record<string, string> = {
    createdAt:  'created_at',
    score:      'score',
    confidence: 'confidence',
  }
  const sortCol = SORT_MAP[sortByRaw] ?? 'created_at'

  const conditions: string[] = []
  const params: (string | number | null)[] = []

  if (filter && filter !== 'all') {
    if (filter === 'manipulated') {
      conditions.push('is_manipulated = 1')
    } else {
      conditions.push('label = ?')
      params.push(filter)
    }
  }

  if (search.trim()) {
    conditions.push('text LIKE ?')
    params.push(`%${search.trim()}%`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countRow = db.first<{ count: number }>(
    `SELECT COUNT(*) as count FROM reviews ${where}`,
    params
  )
  const total = countRow?.count ?? 0

  const rows = db.all<DBReview>(
    `SELECT * FROM reviews ${where} ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  return res.json({
    success: true,
    data: {
      reviews:    rows.map(mapReview),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
})


router.get('/stats', (_req: Request, res: Response) => {
  const rows = db.all<{
    label:          string
    is_manipulated: number
    score:          number
    confidence:     number
  }>('SELECT label, is_manipulated, score, confidence FROM reviews')

  const total = rows.length

  const stats = {
    totalReviews:      total,
    positiveCount:     rows.filter(r => r.label === 'positive').length,
    negativeCount:     rows.filter(r => r.label === 'negative').length,
    neutralCount:      rows.filter(r => r.label === 'neutral').length,
    mixedCount:        rows.filter(r => r.label === 'mixed').length,
    manipulatedCount:  rows.filter(r => r.is_manipulated === 1).length,
    averageScore:      total > 0
      ? Math.round((rows.reduce((s, r) => s + r.score, 0) / total) * 100) / 100
      : 0,
    averageConfidence: total > 0
      ? Math.round((rows.reduce((s, r) => s + r.confidence, 0) / total) * 10) / 10
      : 0,
  }

  return res.json({ success: true, data: stats })
})


router.get('/trend', (_req: Request, res: Response) => {
  const rows = db.all<{
    label:      string
    score:      number
    created_at: string
  }>(
    "SELECT label, score, created_at FROM reviews WHERE created_at >= date('now', '-30 days')"
  )

  const grouped: Record<string, {
    positive: number
    negative: number
    neutral:  number
    mixed:    number
    scores:   number[]
  }> = {}

  for (const row of rows) {
    const date = row.created_at.slice(0, 10)
    if (!grouped[date]) {
      grouped[date] = { positive: 0, negative: 0, neutral: 0, mixed: 0, scores: [] }
    }
    const g = grouped[date]
    if      (row.label === 'positive') g.positive++
    else if (row.label === 'negative') g.negative++
    else if (row.label === 'neutral')  g.neutral++
    else if (row.label === 'mixed')    g.mixed++
    g.scores.push(row.score)
  }

  const trend = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, g]) => ({
      date,
      positive: g.positive,
      negative: g.negative,
      neutral:  g.neutral,
      mixed:    g.mixed,
      avgScore: g.scores.length > 0
        ? Math.round((g.scores.reduce((s, v) => s + v, 0) / g.scores.length) * 100) / 100
        : 0,
    }))

  return res.json({ success: true, data: trend })
})

router.get('/keyword-frequency', (_req: Request, res: Response) => {
  const rows = db.all<{ keywords: string }>('SELECT keywords FROM reviews')

  const freq = new Map<string, { count: number; category: string }>()

  for (const row of rows) {
    let parsed: Array<{ word: string; category: string; occurrences: number }> = []
    try { parsed = JSON.parse(row.keywords || '[]') } catch { /* skip */ }

    for (const kw of parsed) {
      const existing = freq.get(kw.word)
      if (existing) {
        existing.count += kw.occurrences
      } else {
        freq.set(kw.word, { count: kw.occurrences, category: kw.category })
      }
    }
  }

  const sorted = Array.from(freq.entries())
    .map(([word, { count, category }]) => ({ word, count, category }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return res.json({ success: true, data: sorted })
})


router.get('/export', (_req: Request, res: Response) => {
  const rows = db.all<DBReview>(
    'SELECT * FROM reviews ORDER BY created_at DESC'
  )

  const headers = [
    'id', 'label', 'score', 'normalized_score', 'confidence',
    'is_manipulated', 'word_count', 'dominant_emotion', 'source',
    'created_at', 'text',
  ]

  const escape = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return ''
    const s = String(val)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const csvLines = [
    headers.join(','),
    ...rows.map(r =>
      [
        r.id, r.label, r.score, r.normalized_score, r.confidence,
        r.is_manipulated, r.word_count, r.dominant_emotion, r.source, r.created_at, r.text,
      ]
        .map(escape)
        .join(',')
    ),
  ]

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="sentirate-reviews-${new Date().toISOString().slice(0, 10)}.csv"`
  )
  return res.send(csvLines.join('\n'))
})



router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid review ID' })
  }

  const exists = db.first('SELECT id FROM reviews WHERE id = ?', [id])
  if (!exists) {
    return res.status(404).json({ success: false, message: 'Review not found' })
  }

  db.run('DELETE FROM reviews WHERE id = ?', [id])
  return res.json({ success: true, message: 'Review deleted successfully' })
})

export default router