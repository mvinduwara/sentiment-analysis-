import { Router, Request, Response } from 'express'
import { z } from 'zod'
import {
  getAllKeywords,
  addKeyword,
  updateKeyword,
  deleteKeyword,
} from '../services/keywordService'

const router = Router()

const KeywordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(64, 'Word too long'),
  category: z.enum(['positive', 'negative', 'neutral', 'spam'], {
    errorMap: () => ({ message: 'Category must be positive, negative, neutral, or spam' }),
  }),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .int()
    .min(1, 'Weight must be at least 1')
    .max(10, 'Weight cannot exceed 10'),
})

function mapKeyword(k: ReturnType<typeof getAllKeywords>[number]) {
  return {
    id:        k.id,
    word:      k.word,
    category:  k.category,
    weight:    k.weight,
    createdAt: k.created_at,
  }
}

function isDuplicateError(err: unknown): boolean {
  const msg = ((err as Error)?.message ?? '').toLowerCase()
  return msg.includes('unique') || msg.includes('already exists')
}

router.get('/', (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data:    getAllKeywords().map(mapKeyword),
    })
  } catch (err) {
    console.error('[KEYWORDS GET]', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch keywords' })
  }
})

router.post('/', (req: Request, res: Response) => {
  const parsed = KeywordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  try {
    const kw = addKeyword(parsed.data.word, parsed.data.category, parsed.data.weight)
    return res.status(201).json({ success: true, data: mapKeyword(kw) })
  } catch (err) {
    if (isDuplicateError(err)) {
      return res.status(409).json({
        success: false,
        message: `The keyword "${parsed.data.word}" already exists in the databank`,
      })
    }
    console.error('[KEYWORDS POST]', err)
    return res.status(500).json({ success: false, message: 'Failed to add keyword' })
  }
})

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid keyword ID' })
  }

  const parsed = KeywordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  try {
    const kw = updateKeyword(id, parsed.data.word, parsed.data.category, parsed.data.weight)
    if (!kw) {
      return res.status(404).json({ success: false, message: 'Keyword not found' })
    }
    return res.json({ success: true, data: mapKeyword(kw) })
  } catch (err) {
    if (isDuplicateError(err)) {
      return res.status(409).json({
        success: false,
        message: `The keyword "${parsed.data.word}" already exists in the databank`,
      })
    }
    console.error('[KEYWORDS PUT]', err)
    return res.status(500).json({ success: false, message: 'Failed to update keyword' })
  }
})

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid keyword ID' })
  }

  const deleted = deleteKeyword(id)
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Keyword not found' })
  }
  return res.json({ success: true, message: 'Keyword removed from databank' })
})

export default router