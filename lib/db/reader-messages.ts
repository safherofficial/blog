import { sql } from './index'

export type ReaderMessageStatus = 'new' | 'reading' | 'replied' | 'archived'
export type ReaderMessageCategory = 'consiglio' | 'racconto' | 'parere' | 'argomento' | 'altro'

export async function ensureReaderMessagesTable(): Promise<void> {
  await sql`
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
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_reader_messages_created_at ON reader_messages(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reader_messages_status_created_at ON reader_messages(status, created_at DESC)`
}
