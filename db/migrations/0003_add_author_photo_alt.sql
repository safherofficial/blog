-- The production database predates the author photo alt-text field.
-- Add it without touching existing settings or stored content.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS author_photo_alt TEXT;
