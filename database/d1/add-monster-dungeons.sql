-- Monster ↔ dungeon presence with floor info.
-- Up to now this relationship was inferred from orb_drop_rates (which only
-- catches monsters that are a known orb source). Promote it to its own table
-- so a monster can be recorded as present in a dungeon regardless of drops.

CREATE TABLE IF NOT EXISTS monster_dungeons (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    monster_id       INTEGER NOT NULL REFERENCES monsters(id) ON DELETE CASCADE,
    dungeon_id       INTEGER NOT NULL REFERENCES dungeons(id) ON DELETE CASCADE,
    floor            TEXT,
    cite_volume      TEXT,
    cite_chapter     TEXT,
    cite_jnc_part    TEXT,
    cite_source_type TEXT
);

CREATE INDEX IF NOT EXISTS ix_monster_dungeons_monster ON monster_dungeons(monster_id);
CREATE INDEX IF NOT EXISTS ix_monster_dungeons_dungeon ON monster_dungeons(dungeon_id);

-- Seed from existing orb_drop_rates so the new section is populated on day 1.
-- DISTINCT collapses cases where multiple orbs drop from the same monster at
-- the same dungeon/floor.
INSERT INTO monster_dungeons (monster_id, dungeon_id, floor, cite_volume, cite_chapter, cite_jnc_part, cite_source_type)
SELECT DISTINCT monster_id, dungeon_id, floor, cite_volume, cite_chapter, cite_jnc_part, cite_source_type
FROM orb_drop_rates
WHERE monster_id IS NOT NULL AND dungeon_id IS NOT NULL;
