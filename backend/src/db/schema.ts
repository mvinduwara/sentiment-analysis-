export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS reviews (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  text                 TEXT NOT NULL,
  score                REAL NOT NULL DEFAULT 0,
  normalized_score     REAL NOT NULL DEFAULT 0,
  label                TEXT NOT NULL DEFAULT 'neutral',
  confidence           REAL NOT NULL DEFAULT 0,
  is_manipulated       INTEGER NOT NULL DEFAULT 0,
  manipulation_reasons TEXT NOT NULL DEFAULT '[]',
  keywords             TEXT NOT NULL DEFAULT '[]',
  word_count           INTEGER NOT NULL DEFAULT 0,
  dominant_emotion     TEXT NOT NULL DEFAULT 'neutral',
  summary              TEXT NOT NULL DEFAULT '',
  source               TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_label       ON reviews(label);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at  ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_is_manipulated ON reviews(is_manipulated);

CREATE TABLE IF NOT EXISTS keywords (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  word       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  category   TEXT NOT NULL DEFAULT 'positive',
  weight     INTEGER NOT NULL DEFAULT 5,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
`

export const DEFAULT_KEYWORDS = [
  // Positive
  { word: 'excellent', category: 'positive', weight: 8 },
  { word: 'outstanding', category: 'positive', weight: 9 },
  { word: 'fantastic', category: 'positive', weight: 8 },
  { word: 'amazing', category: 'positive', weight: 7 },
  { word: 'wonderful', category: 'positive', weight: 8 },
  { word: 'brilliant', category: 'positive', weight: 8 },
  { word: 'perfect', category: 'positive', weight: 9 },
  { word: 'exceptional', category: 'positive', weight: 9 },
  { word: 'superb', category: 'positive', weight: 8 },
  { word: 'delighted', category: 'positive', weight: 7 },
  { word: 'impressed', category: 'positive', weight: 6 },
  { word: 'recommend', category: 'positive', weight: 6 },
  { word: 'reliable', category: 'positive', weight: 6 },
  { word: 'fast delivery', category: 'positive', weight: 6 },
  { word: 'great quality', category: 'positive', weight: 8 },
  { word: 'love it', category: 'positive', weight: 8 },
  { word: 'very happy', category: 'positive', weight: 7 },
  { word: 'highly recommend', category: 'positive', weight: 9 },
  { word: 'five stars', category: 'positive', weight: 8 },
  { word: 'exceeded expectations', category: 'positive', weight: 10 },
  // Negative
  { word: 'terrible', category: 'negative', weight: 9 },
  { word: 'horrible', category: 'negative', weight: 9 },
  { word: 'awful', category: 'negative', weight: 8 },
  { word: 'disgusting', category: 'negative', weight: 9 },
  { word: 'useless', category: 'negative', weight: 8 },
  { word: 'disappointed', category: 'negative', weight: 7 },
  { word: 'waste of money', category: 'negative', weight: 9 },
  { word: 'broken', category: 'negative', weight: 7 },
  { word: 'defective', category: 'negative', weight: 8 },
  { word: 'rude', category: 'negative', weight: 7 },
  { word: 'scam', category: 'negative', weight: 10 },
  { word: 'fraud', category: 'negative', weight: 10 },
  { word: 'never again', category: 'negative', weight: 9 },
  { word: 'do not buy', category: 'negative', weight: 9 },
  { word: 'complete waste', category: 'negative', weight: 8 },
  { word: 'poor quality', category: 'negative', weight: 8 },
  { word: 'very disappointed', category: 'negative', weight: 8 },
  { word: 'worst ever', category: 'negative', weight: 10 },
  { word: 'total junk', category: 'negative', weight: 8 },
  { word: 'stopped working', category: 'negative', weight: 7 },
  // Neutral
  { word: 'okay', category: 'neutral', weight: 2 },
  { word: 'average', category: 'neutral', weight: 2 },
  { word: 'decent', category: 'neutral', weight: 3 },
  { word: 'fair', category: 'neutral', weight: 2 },
  { word: 'acceptable', category: 'neutral', weight: 3 },
  { word: 'nothing special', category: 'neutral', weight: 2 },
  { word: 'as expected', category: 'neutral', weight: 2 },
  { word: 'alright', category: 'neutral', weight: 2 },
  // Spam indicators
  { word: 'best ever', category: 'spam', weight: 7 },
  { word: 'absolutely perfect', category: 'spam', weight: 8 },
  { word: 'must buy', category: 'spam', weight: 7 },
  { word: 'buy this now', category: 'spam', weight: 9 },
  { word: 'changed my life', category: 'spam', weight: 8 },
  { word: 'everyone should buy', category: 'spam', weight: 9 },
  { word: '10/10 would recommend', category: 'spam', weight: 7 },
  { word: 'no complaints', category: 'spam', weight: 6 },
  { word: 'literally perfect', category: 'spam', weight: 8 },
  { word: 'told all my friends', category: 'spam', weight: 7 },
]