CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER,
  duration_ms INTEGER,
  mistakes INTEGER DEFAULT 0,
  device_id TEXT NOT NULL,
  ip_hash TEXT,
  week_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_best ON leaderboard(game, device_id, week_key);
