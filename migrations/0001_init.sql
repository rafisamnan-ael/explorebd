-- ExploreBD initial schema (Cloudflare D1 / SQLite)

-- Accounts (optional; feature-flagged off by default)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE,
  display_name TEXT,
  avatar_key TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Trips + collaboration
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id),
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_members (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES profiles(id),
  role TEXT NOT NULL DEFAULT 'member',
  invited_email TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_votes (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trip_expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount_bdt REAL NOT NULL,
  paid_by TEXT,
  participants TEXT NOT NULL DEFAULT '[]',
  split_mode TEXT NOT NULL DEFAULT 'equal',
  note TEXT,
  created_at TEXT NOT NULL
);

-- Journal + check-ins
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id),
  district_id TEXT,
  place_id TEXT,
  entry_date TEXT NOT NULL,
  caption TEXT NOT NULL,
  note TEXT,
  rating INTEGER,
  visibility TEXT NOT NULL DEFAULT 'private',
  payload TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  visited_at TEXT,
  created_at TEXT NOT NULL
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER,
  time_ms INTEGER,
  difficulty TEXT,
  game_version INTEGER DEFAULT 1,
  abuse_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard_entries (created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries (score DESC);

-- Share cards
CREATE TABLE IF NOT EXISTS share_cards (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id),
  type TEXT NOT NULL,
  r2_key TEXT,
  payload TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

-- Place reports + price history
CREATE TABLE IF NOT EXISTS place_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id TEXT NOT NULL,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  reporter_hash TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON place_reports (status);

CREATE TABLE IF NOT EXISTS place_price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id TEXT NOT NULL,
  min_bdt REAL,
  max_bdt REAL,
  basis TEXT,
  note TEXT,
  observed_at TEXT NOT NULL
);

-- Content CMS (only if admin is enabled)
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  division_id TEXT,
  lat REAL,
  lng REAL,
  data TEXT
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  district_id TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS place_media (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  author TEXT,
  license TEXT,
  license_url TEXT,
  source_url TEXT,
  modified INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS place_sources (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  source_name TEXT,
  source_url TEXT,
  verified_at TEXT,
  confidence TEXT
);

CREATE TABLE IF NOT EXISTS advisories (
  id TEXT PRIMARY KEY,
  district_id TEXT,
  severity TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_bn TEXT,
  body_en TEXT,
  body_bn TEXT,
  valid_from TEXT,
  valid_until TEXT,
  created_at TEXT NOT NULL
);

-- Audit log for moderation/admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL
);
