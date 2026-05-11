import type {
	Character, CharacterRanking, CharacterStat, CharacterOrb,
	Orb, OrbDropRate, TimelineEvent, Dungeon, Citation,
} from '$lib/utils';

// ─── Row types (flat D1 rows before reshaping) ────────────────────────────────

interface CharRow {
	id: number; slug: string; first_name: string | null; last_name: string | null;
	moniker: string | null; /* stored as JSON array */
	nationality: string | null; date_first_known: string | null;
	cite_first_known_volume: string | null; cite_first_known_chapter: string | null; cite_first_known_jnc_part: string | null;
	is_public: number; is_explorer: number; in_wdarl: number; area: number | null;
	birthday: string | null; sex: string | null; note: string | null; tags: string | null;
}

interface RankRow {
	id: number; character_id: number; rank: number | null; known_above_rank: number | null;
	date_noted: string | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface StatRow {
	id: number; character_id: number; date_noted: string | null; date_sequence: number;
	scan_type: string | null; hp: number | null; mp: number | null; sp: number | null;
	str: number | null; vit: number | null; int: number | null; agi: number | null;
	dex: number | null; luc: number | null; stat_total: number | null; points_from_avg: number | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface CharOrbRow {
	id: number; character_id: number; orb_id: number;
	date_acquired: string | null; date_note: string | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface OrbRow {
	id: number; slug: string; orb_id: number; orb_name: string;
	known_effects: string | null; note: string | null;
}

interface DropRateRow {
	id: number; orb_id: number; creature: string | null; dungeon: string | null;
	dungeon_slug: string | null;
	floor: string | null; favorable_outcomes: number | null; total_events: number | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface TimelineRow {
	id: number; date_utc: string; date_label: string | null; display_time: number;
	timezone: string | null; pre_history: number; event: string;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface DungeonRow {
	id: number; slug: string; name: string; area: number | null; area_label: string | null;
	country: string | null; region: string | null;
	discovered_date: string | null; floors: number | null; is_active: number; note: string | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

interface MonsterRow {
	id: number; slug: string; name: string; category: string | null; note: string | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
	drop_count: number;
}

interface MonsterDropRow {
	orb_id: number; orb_slug: string; orb_name: string;
	dungeon: string | null; dungeon_slug: string | null; floor: string | null;
	favorable_outcomes: number | null; total_events: number | null;
	cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null;
}

// ─── Reshape helpers ──────────────────────────────────────────────────────────

function cite(row: { cite_volume: string | null; cite_chapter: string | null; cite_jnc_part: string | null }): Citation {
	return { volume: row.cite_volume, chapter: row.cite_chapter, jnc_part: row.cite_jnc_part };
}

function toRanking(r: RankRow): CharacterRanking {
	return { id: r.id, character_id: r.character_id, rank: r.rank, known_above_rank: r.known_above_rank, date_noted: r.date_noted, citation: cite(r) };
}

function toStat(s: StatRow): CharacterStat {
	return {
		id: s.id, character_id: s.character_id, date_noted: s.date_noted, date_sequence: s.date_sequence,
		scan_type: s.scan_type, hp: s.hp, mp: s.mp, sp: s.sp, str: s.str, vit: s.vit,
		int: s.int, agi: s.agi, dex: s.dex, luc: s.luc,
		stat_total: s.stat_total, points_from_avg: s.points_from_avg, citation: cite(s),
	};
}

function toCharOrb(o: CharOrbRow): CharacterOrb {
	return { id: o.id, character_id: o.character_id, orb_id: o.orb_id, date_acquired: o.date_acquired, date_note: o.date_note, citation: cite(o) };
}

function toDropRate(d: DropRateRow): OrbDropRate {
	return { id: d.id, orb_id: d.orb_id, creature: d.creature, dungeon: d.dungeon, dungeon_slug: d.dungeon_slug ?? null, floor: d.floor, favorable_outcomes: d.favorable_outcomes, total_events: d.total_events, citation: cite(d) };
}

function toTimeline(t: TimelineRow): TimelineEvent {
	return { id: t.id, date_utc: t.date_utc, date_label: t.date_label, display_time: t.display_time, timezone: t.timezone, pre_history: t.pre_history, event: t.event, citation: cite(t) };
}

function toDungeon(d: DungeonRow): Dungeon {
	return { id: d.id, slug: d.slug, name: d.name, area: d.area, area_label: d.area_label, country: d.country, region: d.region, discovered_date: d.discovered_date, floors: d.floors, is_active: d.is_active, note: d.note, citation: cite(d) };
}

function assembleCharacter(row: CharRow, rankings: CharacterRanking[], stats: CharacterStat[], orbs: CharacterOrb[]): Character {
	const { moniker, tags, ...rest } = row;
	return {
		...rest,
		monikers:         JSON.parse(moniker ?? '[]') as string[],
		tags:             JSON.parse(tags ?? '[]') as string[],
		cite_first_known: { volume: row.cite_first_known_volume, chapter: row.cite_first_known_chapter, jnc_part: row.cite_first_known_jnc_part },
		rankings:  rankings.filter(r => r.character_id === row.id),
		stats:     stats.filter(s => s.character_id === row.id),
		orbs_used: orbs.filter(o => o.character_id === row.id),
	};
}

// ─── Characters ───────────────────────────────────────────────────────────────

export async function getCharacters(db: D1Database): Promise<Character[]> {
	const [charRes, rankRes, orbRes] = await db.batch([
		db.prepare('SELECT * FROM characters'),
		db.prepare('SELECT * FROM character_rankings ORDER BY character_id, cite_volume, cite_chapter, cite_jnc_part'),
		db.prepare('SELECT * FROM character_orbs ORDER BY character_id'),
	]);

	const chars    = (charRes.results as CharRow[]);
	const rankings = (rankRes.results as RankRow[]).map(toRanking);
	const charOrbs = (orbRes.results  as CharOrbRow[]).map(toCharOrb);

	return chars.map(c => assembleCharacter(c, rankings, [], charOrbs));
}

export async function getExplorers(db: D1Database): Promise<Character[]> {
	const [charRes, rankRes, orbRes] = await db.batch([
		db.prepare('SELECT * FROM characters WHERE is_explorer = 1'),
		db.prepare('SELECT * FROM character_rankings ORDER BY character_id, cite_volume, cite_chapter, cite_jnc_part'),
		db.prepare('SELECT * FROM character_orbs ORDER BY character_id'),
	]);

	const chars    = (charRes.results as CharRow[]);
	const rankings = (rankRes.results as RankRow[]).map(toRanking);
	const charOrbs = (orbRes.results  as CharOrbRow[]).map(toCharOrb);

	return chars.map(c => assembleCharacter(c, rankings, [], charOrbs));
}

export async function getNonExplorers(db: D1Database): Promise<Character[]> {
	const res = await db.prepare('SELECT * FROM characters WHERE is_explorer = 0 ORDER BY last_name, first_name').all<CharRow>();
	return res.results.map(c => assembleCharacter(c, [], [], []));
}

export async function getCharacterBySlug(db: D1Database, slug: string): Promise<Character | null> {
	const row = await db.prepare('SELECT * FROM characters WHERE slug = ?').bind(slug).first<CharRow>();
	if (!row) return null;

	const [rankRes, statRes, orbRes] = await db.batch([
		db.prepare('SELECT * FROM character_rankings WHERE character_id = ? ORDER BY cite_volume, cite_chapter, cite_jnc_part').bind(row.id),
		db.prepare('SELECT * FROM character_stats WHERE character_id = ? ORDER BY date_noted, date_sequence').bind(row.id),
		db.prepare('SELECT * FROM character_orbs WHERE character_id = ?').bind(row.id),
	]);

	return assembleCharacter(
		row,
		(rankRes.results as RankRow[]).map(toRanking),
		(statRes.results as StatRow[]).map(toStat),
		(orbRes.results  as CharOrbRow[]).map(toCharOrb),
	);
}

// ─── Orbs ─────────────────────────────────────────────────────────────────────

export async function getOrbs(db: D1Database): Promise<Orb[]> {
	const [orbRes, rateRes] = await db.batch([
		db.prepare('SELECT * FROM orbs'),
		db.prepare('SELECT odr.*, d.slug AS dungeon_slug FROM orb_drop_rates odr LEFT JOIN dungeons d ON d.id = odr.dungeon_id ORDER BY odr.orb_id'),
	]);

	const orbs  = orbRes.results  as OrbRow[];
	const rates = (rateRes.results as DropRateRow[]).map(toDropRate);

	return orbs
		.map(o => ({ ...o, drop_rates: rates.filter(r => r.orb_id === o.id) }))
		.sort((a, b) => {
			if (a.slug === 'making') return -1;
			if (b.slug === 'making') return  1;
			return a.orb_name.localeCompare(b.orb_name);
		});
}

export async function getOrbBySlug(db: D1Database, slug: string): Promise<Orb | null> {
	const row = await db.prepare('SELECT * FROM orbs WHERE slug = ?').bind(slug).first<OrbRow>();
	if (!row) return null;

	const rateRes = await db.prepare('SELECT odr.*, d.slug AS dungeon_slug FROM orb_drop_rates odr LEFT JOIN dungeons d ON d.id = odr.dungeon_id WHERE odr.orb_id = ?').bind(row.id).all<DropRateRow>();
	return { ...row, drop_rates: rateRes.results.map(toDropRate) };
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export async function getTimelineEvents(db: D1Database): Promise<TimelineEvent[]> {
	const res = await db.prepare('SELECT * FROM timeline_events ORDER BY date_utc, id').all<TimelineRow>();
	return res.results.map(toTimeline);
}

// ─── Dungeons ─────────────────────────────────────────────────────────────────

export async function getMonsters(db: D1Database): Promise<Monster[]> {
	const res = await db.prepare(
		`SELECT m.*, COUNT(d.id) AS drop_count
		 FROM monsters m
		 LEFT JOIN orb_drop_rates d ON d.monster_id = m.id
		 GROUP BY m.id ORDER BY m.name`
	).all<MonsterRow>();
	return res.results.map(m => ({
		id: m.id, slug: m.slug, name: m.name, category: m.category,
		note: m.note, citation: cite(m), drop_count: m.drop_count,
	}));
}

export async function getMonsterBySlug(db: D1Database, slug: string): Promise<{ monster: Monster; drops: MonsterDrop[] } | null> {
	const row = await db.prepare(
		`SELECT m.*, 0 AS drop_count FROM monsters m WHERE m.slug = ?`
	).bind(slug).first<MonsterRow>();
	if (!row) return null;

	const dropRes = await db.prepare(
		`SELECT odr.orb_id, o.slug AS orb_slug, o.orb_name, odr.dungeon, odr.floor,
		        dn.slug AS dungeon_slug,
		        odr.favorable_outcomes, odr.total_events,
		        odr.cite_volume, odr.cite_chapter, odr.cite_jnc_part
		 FROM orb_drop_rates odr
		 JOIN orbs o ON o.id = odr.orb_id
		 LEFT JOIN dungeons dn ON dn.id = odr.dungeon_id
		 WHERE odr.monster_id = ?
		 ORDER BY o.orb_name`
	).bind(row.id).all<MonsterDropRow>();

	const drops: MonsterDrop[] = dropRes.results.map(d => ({
		orb_id: d.orb_id, orb_slug: d.orb_slug, orb_name: d.orb_name,
		dungeon: d.dungeon, dungeon_slug: d.dungeon_slug ?? null, floor: d.floor,
		favorable_outcomes: d.favorable_outcomes, total_events: d.total_events,
		citation: cite(d),
	}));

	return { monster: { ...row, citation: cite(row) }, drops };
}

export async function getDungeons(db: D1Database): Promise<Dungeon[]> {
	const res = await db.prepare('SELECT * FROM dungeons ORDER BY name').all<DungeonRow>();
	return res.results.map(toDungeon);
}

export async function getDungeonBySlug(db: D1Database, slug: string): Promise<Dungeon | null> {
	const row = await db.prepare('SELECT * FROM dungeons WHERE slug = ?').bind(slug).first<DungeonRow>();
	return row ? toDungeon(row) : null;
}
