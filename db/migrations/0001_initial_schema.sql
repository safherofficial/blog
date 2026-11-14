CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL CHECK (char_length(excerpt) <= 220),
  cover_image_url TEXT,
  cover_image_alt TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immagini di copertina caricate dal pannello editoriale.
CREATE TABLE IF NOT EXISTS controluce_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  data BYTEA NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 4194304),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- Statistiche proprietarie di prima parte.
CREATE TABLE IF NOT EXISTS site_analytics_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_path TEXT NOT NULL,
  source TEXT NOT NULL,
  medium TEXT,
  campaign TEXT,
  referrer_host TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_analytics_events_created_at
  ON site_analytics_events(created_at);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL DEFAULT 'Controluce',
  tagline TEXT,
  author_name TEXT,
  author_bio JSONB,
  author_photo_url TEXT,
  author_photo_alt TEXT,
  instagram_url TEXT,
  signature_quote TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS reader_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('consiglio', 'racconto', 'parere', 'argomento', 'altro')),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  display_name TEXT CHECK (char_length(display_name) <= 80),
  email TEXT CHECK (char_length(email) <= 254),
  wants_reply BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_acknowledged BOOLEAN NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reading', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  replied_at TIMESTAMPTZ,
  CHECK (NOT wants_reply OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_reader_messages_created_at ON reader_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reader_messages_status_created_at ON reader_messages(status, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_set_updated_at ON posts;
CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
