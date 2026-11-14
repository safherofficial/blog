import { sql } from '@/lib/db'

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000

let lastCleanupAt = 0
let cleanupInFlight: Promise<void> | null = null

/**
 * Retains first-party page-view events for at most 12 months.
 * Runs at most once per day in each warm serverless runtime; a new runtime
 * performs the cleanup on its first analytics or statistics request.
 */
export async function cleanupOldAnalyticsEvents(): Promise<void> {
  if (Date.now() - lastCleanupAt < CLEANUP_INTERVAL_MS) return

  if (!cleanupInFlight) {
    cleanupInFlight = (async () => {
      await sql`DELETE FROM site_analytics_events WHERE created_at < NOW() - INTERVAL '12 months'`
      lastCleanupAt = Date.now()
    })().finally(() => {
      cleanupInFlight = null
    })
  }

  await cleanupInFlight
}
