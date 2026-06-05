import initSqlJs, { Database } from 'sql.js'
import path from 'path'
import fs from 'fs'
import { SCHEMA_SQL, DEFAULT_KEYWORDS } from './schema'

const DB_DIR  = path.join(__dirname, '../../data')
const DB_PATH = path.join(DB_DIR, 'sentirate.db')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

let _db: Database | null = null

function save(): void {
  if (!_db) return
  const data = _db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

export function getDb(): Database {
  if (!_db) throw new Error('Database not initialised — call initDatabase() first')
  return _db
}

export function run(sql: string, params: (string | number | null)[] = []): void {
  getDb().run(sql, params)
  save()
}

export function all<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): T[] {
  const stmt = getDb().prepare(sql)
  stmt.bind(params)
  const rows: T[] = []
  while (stmt.step()) rows.push(stmt.getAsObject() as T)
  stmt.free()
  return rows
}

export function first<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): T | undefined {
  return all<T>(sql, params)[0]
}

export function insert(sql: string, params: (string | number | null)[] = []): number {
  getDb().run(sql, params)
  save()
  const idRow = first<{ id: number }>('SELECT last_insert_rowid() as id')
  return idRow?.id ?? 0
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    _db = new SQL.Database(fileBuffer)
    console.log(`[DB] Loaded existing database from ${DB_PATH}`)
  } else {
    _db = new SQL.Database()
    console.log(`[DB] Created new database at ${DB_PATH}`)
  }

  _db.run(SCHEMA_SQL)
  save()

  const countRow = first<{ c: number }>('SELECT COUNT(*) as c FROM keywords')
  if ((countRow?.c ?? 0) === 0) {
    for (const kw of DEFAULT_KEYWORDS) {
      try {
        _db.run(
          'INSERT OR IGNORE INTO keywords (word, category, weight) VALUES (?, ?, ?)',
          [kw.word, kw.category, kw.weight]
        )
      } catch {
        // Ignore any errors during seeding (e.g. duplicates)
      }
    }
    save()
    console.log(`[DB] Seeded ${DEFAULT_KEYWORDS.length} default keywords`)
  }

  console.log('[DB] Ready')
}

const db = { run, all, first, insert, getDb, save }
export default db