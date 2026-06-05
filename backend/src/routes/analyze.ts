import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { analyzeText } from '../services/sentimentEngine'
import db from '../db/database'

const router = Router()

const AnalyzeSchema = z.object({
  text: z
    .string()
    .min(1,    'Review text is required')
    .max(2000, 'Text must be 2000 characters or fewer'),
  source: z.string().max(64).optional(),
})

router.post('/', (req: Request, res: Response) => {
  const parsed = AnalyzeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.errors[0]?.message ?? 'Invalid input',
    })
  }

  const { text, source } = parsed.data

  try {
    const result = analyzeText(text)

    db.run(
      `INSERT INTO reviews (
        text,
        score,
        normalized_score,
        label,
        confidence,
        is_manipulated,
        manipulation_reasons,
        keywords,
        word_count,
        dominant_emotion,
        summary,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        text,
        result.score,
        result.normalizedScore,
        result.label,
        result.confidence,
        result.isManipulated ? 1 : 0,
        JSON.stringify(result.manipulationReasons),
        JSON.stringify(result.keywords),
        result.wordCount,
        result.dominantEmotion,
        result.summary,
        source ?? null,
      ]
    )

    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    console.error('[ANALYZE ERROR]', err)
    return res.status(500).json({
      success: false,
      message: 'Analysis failed — please try again',
    })
  }
})

export default router