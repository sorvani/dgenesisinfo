-- Add area column to dungeons and seed known dungeons
-- Run: wrangler d1 execute dgenesisinfo --remote --file=database/d1/add-dungeon-area-and-seed.sql

ALTER TABLE dungeons ADD COLUMN area INTEGER;

INSERT OR IGNORE INTO dungeons (slug, name, area, country, region, is_active, cite_volume, cite_chapter, cite_jnc_part) VALUES
    ('the-ring',              'The Ring',                   1,  'US', 'Groom Lake, Nevada', 0, '1', '1', '1'),
    ('evans',                 'Evans',                     36, 'US', 'Denver, CO',         1, NULL, NULL, NULL),
    ('yoyogi',                'Yoyogi',                    12, 'JP', 'Tokyo',              1, '1', '1', '1'),
    ('unformed-aoyama',       'Unformed Aoyama',           12, 'JP', 'Tokyo',              0, '1', '1', '1'),
    ('wandering-mansion',     'Wandering Mansion',        NULL, NULL, NULL,                1, NULL, NULL, NULL),
    ('unknown-australia',     'Unknown (Australia)',       NULL, 'AU', NULL,               1, NULL, NULL, NULL),
    ('unknown-france',        'Unknown (France)',          NULL, 'FR', NULL,               1, NULL, NULL, NULL),
    ('unknown-okinawa',       'Unknown (Okinawa)',         NULL, 'JP', 'Okinawa',          1, NULL, NULL, NULL);
