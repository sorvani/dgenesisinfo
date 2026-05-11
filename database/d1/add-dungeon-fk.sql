-- Add dungeon_id FK to orb_drop_rates
-- Run: wrangler d1 execute dgenesisinfo --remote --file=database/d1/add-dungeon-fk.sql

ALTER TABLE orb_drop_rates ADD COLUMN dungeon_id INTEGER REFERENCES dungeons(id);

-- Populate by exact name match
UPDATE orb_drop_rates
SET dungeon_id = (SELECT id FROM dungeons WHERE name = orb_drop_rates.dungeon)
WHERE dungeon IS NOT NULL;

-- Fix the three mismatched "Unknown in X" names
UPDATE orb_drop_rates SET dungeon_id = (SELECT id FROM dungeons WHERE slug = 'unknown-australia') WHERE dungeon = 'Unknown in Australia';
UPDATE orb_drop_rates SET dungeon_id = (SELECT id FROM dungeons WHERE slug = 'unknown-france')    WHERE dungeon = 'Unknown in France';
UPDATE orb_drop_rates SET dungeon_id = (SELECT id FROM dungeons WHERE slug = 'unknown-okinawa')   WHERE dungeon = 'Unknown in Okinawa';

CREATE INDEX IF NOT EXISTS ix_orb_drop_rates_dungeon ON orb_drop_rates(dungeon_id);
