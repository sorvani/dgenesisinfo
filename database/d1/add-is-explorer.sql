-- Add is_explorer flag to characters table
-- Run once: wrangler d1 execute dgenesisinfo --remote --file=database/d1/add-is-explorer.sql

ALTER TABLE characters ADD COLUMN is_explorer INTEGER NOT NULL DEFAULT 0;

-- Everyone with WDARL, rankings, stats, or orbs is an explorer
UPDATE characters SET is_explorer = 1 WHERE in_wdarl = 1;
UPDATE characters SET is_explorer = 1 WHERE id IN (SELECT DISTINCT character_id FROM character_rankings);
UPDATE characters SET is_explorer = 1 WHERE id IN (SELECT DISTINCT character_id FROM character_stats);
UPDATE characters SET is_explorer = 1 WHERE id IN (SELECT DISTINCT character_id FROM character_orbs);

-- Kakeru Furai is explicitly NOT an explorer
UPDATE characters SET is_explorer = 0 WHERE slug = 'kakeru-furai';
