-- Rimuove l'identificatore temporaneo di visitatore introdotto in una vecchia preview.
-- Gli eventi statistici correnti non usano identificatori persistenti.
ALTER TABLE site_analytics_events DROP COLUMN IF EXISTS visitor_hash;
