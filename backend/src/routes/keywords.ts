import db from '../db/database'
import type { DBKeyword, KeywordCategory } from '../types'

export function getAllKeywords(): DBKeyword[] {
  return db.all<DBKeyword>(
    'SELECT * FROM keywords ORDER BY category ASC, word ASC'
  )
}

export function getKeywordsByCategory(category: KeywordCategory): DBKeyword[] {
  return db.all<DBKeyword>(
    'SELECT * FROM keywords WHERE category = ? ORDER BY weight DESC',
    [category]
  )
}

export function addKeyword(
  word: string,
  category: KeywordCategory,
  weight: number
): DBKeyword {
  const clean = word.toLowerCase().trim()

  const existing = db.first<DBKeyword>(
    'SELECT * FROM keywords WHERE word = ?',
    [clean]
  )
  if (existing) {
    throw new Error('UNIQUE constraint failed: keyword already exists')
  }

  const id = db.insert(
    'INSERT INTO keywords (word, category, weight) VALUES (?, ?, ?)',
    [clean, category, weight]
  )

  const inserted = db.first<DBKeyword>(
    'SELECT * FROM keywords WHERE id = ?',
    [id]
  )
  if (!inserted) throw new Error('Failed to retrieve inserted keyword')
  return inserted
}

export function updateKeyword(
  id: number,
  word: string,
  category: KeywordCategory,
  weight: number
): DBKeyword | undefined {
  const clean = word.toLowerCase().trim()

  const conflict = db.first<DBKeyword>(
    'SELECT * FROM keywords WHERE word = ? AND id != ?',
    [clean, id]
  )
  if (conflict) {
    throw new Error('UNIQUE constraint failed: keyword already exists')
  }

  db.run(
    'UPDATE keywords SET word = ?, category = ?, weight = ? WHERE id = ?',
    [clean, category, weight, id]
  )

  return db.first<DBKeyword>(
    'SELECT * FROM keywords WHERE id = ?',
    [id]
  )
}

export function deleteKeyword(id: number): boolean {
  const existing = db.first(
    'SELECT id FROM keywords WHERE id = ?',
    [id]
  )
  if (!existing) return false
  db.run('DELETE FROM keywords WHERE id = ?', [id])
  return true
}

export function getKeywordMap(): Map<string, { category: KeywordCategory; weight: number }> {
  const rows = db.all<{ word: string; category: KeywordCategory; weight: number }>(
    'SELECT word, category, weight FROM keywords'
  )
  const map = new Map<string, { category: KeywordCategory; weight: number }>()
  for (const row of rows) {
    map.set(row.word.toLowerCase(), {
      category: row.category,
      weight: Number(row.weight),
    })
  }
  return map
}