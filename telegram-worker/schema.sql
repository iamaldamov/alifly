CREATE TABLE IF NOT EXISTS telegram_users (
  telegram_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  language_code TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  current_stage INTEGER NOT NULL DEFAULT 1,
  current_lesson INTEGER NOT NULL DEFAULT 1,
  completed_lessons TEXT NOT NULL DEFAULT '[]',
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_updated_at
  ON telegram_users(updated_at);
