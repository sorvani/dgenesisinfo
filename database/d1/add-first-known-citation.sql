-- Add first-known citation fields to characters
-- Separate from ranking citations — can be independently edited
-- Run: wrangler d1 execute dgenesisinfo --remote --file=database/d1/add-first-known-citation.sql

ALTER TABLE characters ADD COLUMN cite_first_known_volume   TEXT;
ALTER TABLE characters ADD COLUMN cite_first_known_chapter  TEXT;
ALTER TABLE characters ADD COLUMN cite_first_known_jnc_part TEXT;

-- Seed from earliest ranking citation for characters that have rankings
UPDATE characters
SET
    cite_first_known_volume   = (
        SELECT cite_volume FROM character_rankings
        WHERE character_id = characters.id AND cite_volume IS NOT NULL
        ORDER BY CAST(cite_volume AS INTEGER), CAST(cite_chapter AS INTEGER), CAST(cite_jnc_part AS INTEGER)
        LIMIT 1
    ),
    cite_first_known_chapter  = (
        SELECT cite_chapter FROM character_rankings
        WHERE character_id = characters.id AND cite_volume IS NOT NULL
        ORDER BY CAST(cite_volume AS INTEGER), CAST(cite_chapter AS INTEGER), CAST(cite_jnc_part AS INTEGER)
        LIMIT 1
    ),
    cite_first_known_jnc_part = (
        SELECT cite_jnc_part FROM character_rankings
        WHERE character_id = characters.id AND cite_volume IS NOT NULL
        ORDER BY CAST(cite_volume AS INTEGER), CAST(cite_chapter AS INTEGER), CAST(cite_jnc_part AS INTEGER)
        LIMIT 1
    )
WHERE EXISTS (
    SELECT 1 FROM character_rankings WHERE character_id = characters.id
);
