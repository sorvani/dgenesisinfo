-- ─────────────────────────────────────────────────────────────────────────────
-- Monsters
-- Run once against existing DB: wrangler d1 execute dgenesisinfo --remote --file=database/d1/add-monsters.sql
-- This is also appended to schema.sql so fresh installs include it.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS monsters (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT    NOT NULL UNIQUE,
    name         TEXT    NOT NULL,
    -- category: Humanoid | Beast | Undead | Demon | Aberration | Aquatic | Elemental | Ooze | Unknown
    category     TEXT,
    note         TEXT,        -- Markdown ok
    cite_volume  TEXT,
    cite_chapter TEXT,
    cite_jnc_part TEXT,
    created_utc  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    modified_utc TEXT
);

-- Add monster FK to orb_drop_rates (nullable — existing rows stay intact)
ALTER TABLE orb_drop_rates ADD COLUMN monster_id INTEGER REFERENCES monsters(id);
CREATE INDEX IF NOT EXISTS ix_orb_drop_rates_monster ON orb_drop_rates(monster_id);

-- ── Seed: known monsters extrapolated from drop rate data ─────────────────────

INSERT OR IGNORE INTO monsters (slug, name, category, cite_volume, cite_chapter, cite_jnc_part) VALUES
    ('barghest',           'Barghest',           'Demon',       '2', '3', '6'),
    ('chameleon',          'Chameleon',           'Beast',       '5', '6', NULL),
    ('eyeball',            'Eyeball',             'Aberration',  '2', '3', '7'),
    ('genomos',            'Genomos',             'Unknown',     NULL, NULL, NULL),
    ('goblin',             'Goblin',              'Humanoid',    '2', '3', '1'),
    ('great-white-shark',  'Great White Shark',   'Aquatic',     NULL, NULL, NULL),
    ('hound-of-hecate',    'Hound of Hecate',     'Demon',       '2', '3', '2'),
    ('kobold',             'Kobold',              'Humanoid',    '2', '3', '2'),
    ('lesser-salamandora', 'Lesser Salamandora',  'Elemental',   NULL, NULL, NULL),
    ('skeleton',           'Skeleton',            'Undead',      NULL, NULL, NULL),
    ('slime',              'Slime',               'Ooze',        NULL, NULL, NULL),
    ('wolf',               'Wolf',                'Beast',       '3', '4', '1'),
    ('zombie',             'Zombie',              'Undead',      NULL, NULL, NULL);

-- Link existing drop_rate rows to monster records by matching creature name
UPDATE orb_drop_rates SET monster_id = (SELECT id FROM monsters WHERE name = creature)
WHERE creature IS NOT NULL;
