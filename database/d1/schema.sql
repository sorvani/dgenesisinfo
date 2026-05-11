-- ─────────────────────────────────────────────────────────────────────────────
-- Characters
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slug             TEXT    NOT NULL UNIQUE,
    first_name       TEXT,
    last_name        TEXT,
    moniker          TEXT,
    nationality      TEXT,        -- 2-letter country code (JP, US, RU, ...)
    date_first_known TEXT,        -- YYYY-MM-DD
    is_public        INTEGER NOT NULL DEFAULT 1,  -- 0 = anonymous on WDARL
    in_wdarl         INTEGER NOT NULL DEFAULT 0,
    area             INTEGER,     -- D-Card area number
    birthday         TEXT,
    sex              TEXT,
    note             TEXT,        -- HTML ok
    tags             TEXT,        -- JSON array e.g. ["D-Powers","JDA"]
    created_utc      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    modified_utc     TEXT
);

-- Ranking entries — one row per citation point
CREATE TABLE IF NOT EXISTS character_rankings (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id     INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    rank             INTEGER,
    known_above_rank INTEGER,     -- rank unknown but confirmed above this value
    date_noted       TEXT,        -- YYYY-MM-DD
    cite_volume      TEXT,
    cite_chapter     TEXT,
    cite_jnc_part    TEXT,
    cite_source_type TEXT   -- 'Light Novel' | 'Manga' | NULL
);

CREATE INDEX IF NOT EXISTS ix_char_rankings_character ON character_rankings(character_id);

-- Stat snapshots — one row per measurement
CREATE TABLE IF NOT EXISTS character_stats (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id    INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    date_noted      TEXT,         -- YYYY-MM-DD
    date_sequence   INTEGER NOT NULL DEFAULT 1, -- order when multiple scans on same day
    scan_type       TEXT,         -- Making | Appraisal | Stat Measuring Device
    hp              REAL,
    mp              REAL,
    sp              REAL,
    str             INTEGER,
    vit             INTEGER,
    int             INTEGER,
    agi             INTEGER,
    dex             INTEGER,
    luc             INTEGER,
    stat_total      INTEGER,
    points_from_avg INTEGER,
    cite_volume     TEXT,
    cite_chapter    TEXT,
    cite_jnc_part   TEXT,
    cite_source_type TEXT
);

CREATE INDEX IF NOT EXISTS ix_char_stats_character ON character_stats(character_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Skill orbs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orbs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT    NOT NULL UNIQUE,
    orb_name      TEXT    NOT NULL,
    known_effects TEXT,   -- HTML ok
    note          TEXT,
    created_utc   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    modified_utc  TEXT
);

CREATE TABLE IF NOT EXISTS orb_drop_rates (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    orb_id             INTEGER NOT NULL REFERENCES orbs(id) ON DELETE CASCADE,
    creature           TEXT,
    dungeon            TEXT,
    floor              TEXT,
    favorable_outcomes REAL,
    total_events       REAL,
    cite_volume        TEXT,
    cite_chapter       TEXT,
    cite_jnc_part      TEXT,
    cite_source_type   TEXT
);

CREATE INDEX IF NOT EXISTS ix_orb_drop_rates_orb ON orb_drop_rates(orb_id);

-- Character orb acquisitions
CREATE TABLE IF NOT EXISTS character_orbs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    orb_id       INTEGER NOT NULL REFERENCES orbs(id),
    date_acquired TEXT,
    date_note    TEXT,
    cite_volume  TEXT,
    cite_chapter TEXT,
    cite_jnc_part TEXT,
    cite_source_type TEXT
);

CREATE INDEX IF NOT EXISTS ix_char_orbs_character ON character_orbs(character_id);
CREATE INDEX IF NOT EXISTS ix_char_orbs_orb       ON character_orbs(orb_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Timeline
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timeline_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    date_utc     TEXT    NOT NULL,  -- ISO 8601
    date_label   TEXT,              -- display override e.g. "Early Summer 2015"
    display_time INTEGER NOT NULL DEFAULT 0,  -- 0 = date only, 1 = include time
    timezone     TEXT,              -- JST | EST | UTC | CET | ...
    pre_history  INTEGER NOT NULL DEFAULT 0,  -- events before dungeon discovery
    event        TEXT    NOT NULL,  -- HTML ok
    cite_volume  TEXT,
    cite_chapter TEXT,
    cite_jnc_part TEXT,
    cite_source_type TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Dungeons
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dungeons (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    slug             TEXT    NOT NULL UNIQUE,
    name             TEXT    NOT NULL,
    country          TEXT,           -- 2-letter country code
    region           TEXT,           -- city / prefecture / state
    discovered_date  TEXT,           -- YYYY-MM-DD
    floors           INTEGER,        -- highest known floor
    is_active        INTEGER NOT NULL DEFAULT 1,
    note             TEXT,           -- HTML ok
    cite_volume      TEXT,
    cite_chapter     TEXT,
    cite_jnc_part    TEXT,
    cite_source_type TEXT,
    created_utc      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    modified_utc     TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auth — GitHub OAuth, server-side sessions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    github_id       INTEGER NOT NULL UNIQUE,
    github_username TEXT    NOT NULL,
    is_admin        INTEGER NOT NULL DEFAULT 0,
    created_utc     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    last_seen_utc   TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    token       TEXT    PRIMARY KEY,  -- 32 random bytes, hex-encoded
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_utc TEXT    NOT NULL,
    created_utc TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    ip_address  TEXT,
    user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS ix_sessions_user ON sessions(user_id);

-- Short-lived state tokens for OAuth CSRF protection; cleaned up after use
CREATE TABLE IF NOT EXISTS oauth_states (
    state       TEXT PRIMARY KEY,
    created_utc TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Contribution pipeline
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_submissions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_by  INTEGER NOT NULL REFERENCES users(id),
    submitted_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    -- entity_type: character | orb | timeline_event | dungeon
    --              character_stat | character_ranking | character_orb | orb_drop_rate
    entity_type   TEXT    NOT NULL,
    entity_id     INTEGER,          -- NULL for new records
    operation     TEXT    NOT NULL, -- insert | update | delete
    proposed_data TEXT    NOT NULL, -- JSON of the proposed field values
    status        TEXT    NOT NULL DEFAULT 'pending', -- pending | approved | rejected
    reviewed_by   INTEGER REFERENCES users(id),
    reviewed_at   TEXT,
    admin_note    TEXT
);

CREATE INDEX IF NOT EXISTS ix_submissions_status       ON pending_submissions(status);
CREATE INDEX IF NOT EXISTS ix_submissions_submitted_by ON pending_submissions(submitted_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- Monsters
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS monsters (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    slug         TEXT    NOT NULL UNIQUE,
    name         TEXT    NOT NULL,
    -- category: Humanoid | Beast | Undead | Demon | Aberration | Aquatic | Elemental | Ooze | Unknown
    category     TEXT,
    note         TEXT,
    cite_volume  TEXT,
    cite_chapter TEXT,
    cite_jnc_part TEXT,
    cite_source_type TEXT,
    created_utc  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    modified_utc TEXT
);

ALTER TABLE orb_drop_rates ADD COLUMN IF NOT EXISTS monster_id INTEGER REFERENCES monsters(id);
CREATE INDEX IF NOT EXISTS ix_orb_drop_rates_monster ON orb_drop_rates(monster_id);

-- Monster ↔ dungeon presence (with floor info). Independent of orb drops:
-- a monster can be recorded as present in a dungeon even if no orb data exists.
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
