# Schema History

A running record of changes to the D1 schema. The current canonical schema
lives in [`schema.sql`](schema.sql); this file documents what changed and why
over time.

When making a schema change:
1. Update `schema.sql` so fresh installs include the change.
2. Apply the change to the live D1 (either by running the relevant SQL
   directly or by re-running `schema.sql` if the statements use
   `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).
3. Refresh `snapshot.sql` with `npm run dump` (from `web/`) so anyone cloning
   the repo gets the new shape plus current data.
4. Add an entry below describing the change.

Entries are newest first.

---

## 2026-05-11 — document `orb_drop_rates.dungeon_id` and backfill missing FKs

The `dungeon_id` FK column was already present on the live `orb_drop_rates`
table (added at some point alongside `monster_id`) but never made it into
`schema.sql`. Added the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS dungeon_id`
and matching index so a fresh bootstrap matches production.

Companion fix in the app: the contribute form's Dungeon `<select>` for orb
drops was binding to a `string` and using `value={d.name}`, so it only ever
wrote the legacy `dungeon` text column and left `dungeon_id` NULL. Three
existing rows (all Chameleon @ Yoyogi: Camouflage / Invisibility / Tongue
Shot, IDs 7, 21, 45) were backfilled by name match.

---

## 2026-05-11 — drop `orbs.orb_id` column

Vestigial leftover from the old JSON site, where rows were tied together by
that field. Once the data moved into D1 every relationship is keyed off
`orbs.id` (the PK) so nothing was reading `orb_id` anymore — it was just
blocking new orb submissions because of its `NOT NULL UNIQUE` constraint.

SQLite refuses to drop UNIQUE columns directly, so the migration uses the
standard table-rebuild pattern: create `orbs_new` without the column, copy
the rows, drop the old table, rename the new one (with foreign keys
deferred for the duration).

## 2026-05-11 — `monster_dungeons` table

First-class monster ↔ dungeon presence with floor info. Until this point the
"Creatures Found Here" section on a dungeon page was derived from
`orb_drop_rates`, which only catches monsters that are a known orb source.
The new table lets a monster be recorded as present in a dungeon regardless
of whether anything drops there.

Seeded with `DISTINCT (monster_id, dungeon_id, floor, citation)` rows from
`orb_drop_rates` so the section was populated on day one.

## 2026-05-11 — `cite_source_type` on every cited table

Added a `cite_source_type` (`'Light Novel' | 'Manga' | NULL`) column to:
`characters` (as `cite_first_known_source_type`), `character_rankings`,
`character_stats`, `character_orbs`, `orb_drop_rates`, `timeline_events`,
`dungeons`, `monsters`. Lets citations disambiguate between the light novel
and manga adaptations.

## 2026-05-10 — `monsters` table + `orb_drop_rates.monster_id` FK

Promoted creatures from free-text `orb_drop_rates.creature` to their own
`monsters` table with slug, name, category, note, and citation. Added
`monster_id` FK on `orb_drop_rates` so drops link back to a canonical row.

## 2026-05-10 — `orb_drop_rates.dungeon_id` FK

Linked `orb_drop_rates` to `dungeons` via a `dungeon_id` column, replacing
the free-text `dungeon` field as the source of truth. Backfilled by matching
on dungeon name (with special-cases for `Unknown in Australia/France/Okinawa`
where the names had drifted).

## 2026-05-10 — Dungeon `area` + `area_label` + seed rows

Added the `area` (D-Card area number) and `area_label` ("All" etc.) columns
to `dungeons`. Seeded the known canonical dungeons: The Ring, Evans, Yoyogi,
Unformed Aoyama, Wandering Mansion, and three "Unknown in COUNTRY" entries.

## 2026-05-10 — `characters.cite_first_known_*`

Split first-known citation off from ranking citations on `characters`.
Added `cite_first_known_volume`, `cite_first_known_chapter`, and
`cite_first_known_jnc_part`. Backfilled from each character's earliest
ranking citation where one existed.

## 2026-05-10 — `characters.is_explorer` flag

Added an explicit `is_explorer` boolean to `characters` so a character can
be marked as a named non-explorer without WDARL-implicit promotion. Seeded
from prior data: anyone with WDARL, rankings, stats, or orbs was flagged as
an explorer (except Kakeru Furai, explicitly excluded).
