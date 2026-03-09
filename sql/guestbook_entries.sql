CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_profile_id
  ON guestbook_entries(profile_id);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_created_at
  ON guestbook_entries(created_at DESC);
