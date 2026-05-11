// ─── Types ────────────────────────────────────────────────────────────────────

export interface Citation {
	volume:      string | null;
	chapter:     string | null;
	jnc_part:    string | null;
	source_type: string | null;  // 'Light Novel' | 'Manga' | null
}

export interface CharacterRanking {
	id:               number;
	character_id:     number;
	rank:             number | null;
	known_above_rank: number | null;
	date_noted:       string | null;
	citation:         Citation;
}

export interface CharacterStat {
	id:              number;
	character_id:    number;
	date_noted:      string | null;
	date_sequence:   number;
	scan_type:       string | null;
	hp:              number | null;
	mp:              number | null;
	sp:              number | null;
	str:             number | null;
	vit:             number | null;
	int:             number | null;
	agi:             number | null;
	dex:             number | null;
	luc:             number | null;
	stat_total:      number | null;
	points_from_avg: number | null;
	citation:        Citation;
}

export interface CharacterOrb {
	id:            number;
	character_id:  number;
	orb_id:        number;
	date_acquired: string | null;
	date_note:     string | null;
	citation:      Citation;
}

export interface Character {
	id:               number;
	slug:             string;
	first_name:       string | null;
	last_name:        string | null;
	monikers:         string[];
	nationality:      string | null;
	date_first_known: string | null;
	cite_first_known: Citation;
	is_public:        number;
	is_explorer:      number;
	in_wdarl:         number;
	area:             number | null;
	birthday:         string | null;
	sex:              string | null;
	note:             string | null;
	tags:             string[];
	rankings:         CharacterRanking[];
	stats:            CharacterStat[];
	orbs_used:        CharacterOrb[];
}

export interface OrbDropRate {
	id:                 number;
	orb_id:             number;
	creature:           string | null;
	dungeon:            string | null;
	dungeon_slug:       string | null;
	monster_name:       string | null;
	monster_slug:       string | null;
	floor:              string | null;
	favorable_outcomes: number | null;
	total_events:       number | null;
	citation:           Citation;
}

export interface Orb {
	id:            number;
	slug:          string;
	orb_name:      string;
	known_effects: string | null;
	note:          string | null;
	drop_rates:    OrbDropRate[];
}

export interface TimelineEvent {
	id:           number;
	date_utc:     string;
	date_label:   string | null;
	display_time: number;
	timezone:     string | null;
	pre_history:  number;
	event:        string;
	citation:     Citation;
}

export interface Dungeon {
	id:              number;
	slug:            string;
	name:            string;
	area:            number | null;
	area_label:      string | null;
	country:         string | null;
	region:          string | null;
	discovered_date: string | null;
	floors:          number | null;
	is_active:       number;
	note:            string | null;
	citation:        Citation;
}

export interface Monster {
	id:         number;
	slug:       string;
	name:       string;
	category:   string | null;
	note:       string | null;
	citation:   Citation;
	drop_count: number;
	dungeons:   { id: number; name: string; slug: string }[];
}

export interface MonsterDrop {
	id:                 number;
	orb_id:             number;
	orb_slug:           string;
	orb_name:           string;
	dungeon:            string | null;
	dungeon_slug:       string | null;
	floor:              string | null;
	favorable_outcomes: number | null;
	total_events:       number | null;
	citation:           Citation;
}

export interface MonsterDungeon {
	id:           number;
	monster_id:   number;
	dungeon_id:   number;
	floor:        string | null;
	citation:     Citation;
	// Denormalized join fields (populated when reading via slug-aware queries)
	monster_name?: string;
	monster_slug?: string;
	dungeon_name?: string;
	dungeon_slug?: string;
}

// ─── Citation helpers ─────────────────────────────────────────────────────────

export function getCitationScore(citation: Citation | null): number {
	if (!citation) return 0;
	const v = parseFloat(citation.volume   ?? '0') || 0;
	const c = parseFloat(citation.chapter  ?? '0') || 0;
	const p = parseFloat(citation.jnc_part ?? '0') || 0;
	return (v * 1_000_000) + (c * 1_000) + p;
}

// Floor display helper: "10" → "10<sup>th</sup>", "5-7" → "5-7", "B1" → "B1",
// "10<sup>th</sup>" (legacy) → unchanged. Pass result through {@html}.
export function formatFloor(floor: string | null | undefined): string {
	if (!floor) return '';
	const trimmed = floor.trim();
	if (!trimmed) return '';
	// Already contains HTML — assume the author hand-formatted it, leave alone.
	if (trimmed.includes('<')) return trimmed;
	// "10th", "1st", etc. — re-wrap the suffix.
	const suffixed = trimmed.match(/^(\d+)(st|nd|rd|th)$/i);
	if (suffixed) return `${suffixed[1]}<sup>${suffixed[2].toLowerCase()}</sup>`;
	// Pure number — add the right ordinal suffix.
	if (/^\d+$/.test(trimmed)) {
		const n = parseInt(trimmed, 10);
		const v = n % 100;
		const suffix = (v >= 11 && v <= 13) ? 'th'
			: ['th','st','nd','rd','th','th','th','th','th','th'][n % 10];
		return `${n}<sup>${suffix}</sup>`;
	}
	// Range, basement, or anything else — leave as written.
	return trimmed;
}

function isSideStories(volume: string | null | undefined): boolean {
	return (volume ?? '').trim().toLowerCase() === 'side stories';
}

export function formatCitation(citation: Citation | null): string {
	if (!citation) return '';
	const parts: string[] = [];
	if (citation.volume) {
		// "Side Stories" reads as a label, not a numbered volume — show it as-is.
		parts.push(isSideStories(citation.volume) ? citation.volume : `Vol ${citation.volume}`);
	}
	if (citation.chapter)     parts.push(`Ch ${citation.chapter}`);
	if (citation.jnc_part)    parts.push(`Part ${citation.jnc_part}`);
	if (citation.source_type) parts.push(citation.source_type === 'Light Novel' ? 'LN' : 'M');
	return parts.join(' · ');
}

// J-Novel Club reading link for a citation, when we have enough info to build one.
// LN URL pattern:        /read/d-genesis-volume-{volume}-part-{jnc_part}
// LN side-stories:       /read/d-genesis-side-stories-part-{jnc_part}
// Manga URL pattern:     /read/d-genesis-three-years-after-the-dungeons-appeared-manga-volume-{volume}-chapter-{jnc_part}
// (Manga chapter and JNC part are the same number; jnc_part is the authoritative source.)
export function getCitationUrl(c: Citation | null): string | null {
	if (!c?.volume || !c.source_type) return null;
	if (c.source_type === 'Light Novel') {
		if (!c.jnc_part) return null;
		const volPath = isSideStories(c.volume) ? 'side-stories' : `volume-${c.volume}`;
		return `https://j-novel.club/read/d-genesis-${volPath}-part-${c.jnc_part}`;
	}
	if (c.source_type === 'Manga') {
		const ch = c.jnc_part || c.chapter;
		if (!ch) return null;
		return `https://j-novel.club/read/d-genesis-three-years-after-the-dungeons-appeared-manga-volume-${c.volume}-chapter-${ch}`;
	}
	return null;
}

// ─── Ranking helpers ──────────────────────────────────────────────────────────

export function getHistoricalRankingAt(
	rankings: CharacterRanking[],
	maxScore: number | null = null
): CharacterRanking | null {
	if (!rankings.length) return null;
	let valid = maxScore === null
		? rankings
		: rankings.filter(r => getCitationScore(r.citation) <= maxScore);
	if (!valid.length) return null;
	return valid.slice().sort((a, b) => getCitationScore(b.citation) - getCitationScore(a.citation))[0];
}

export function getRankSortValue(rankings: CharacterRanking[], maxScore: number | null = null): number {
	const r = getHistoricalRankingAt(rankings, maxScore);
	if (!r) return Infinity;
	if (r.rank) return r.rank;
	if (r.known_above_rank) return r.known_above_rank - 1;
	return Infinity;
}

export function formatRank(ranking: CharacterRanking | null): string {
	if (!ranking) return 'Unknown';
	if (ranking.rank) return ranking.rank.toLocaleString();
	if (ranking.known_above_rank) return `Above ${ranking.known_above_rank.toLocaleString()}`;
	return 'Unknown';
}

export function getAllUniqueRankingCitations(characters: Character[]): Citation[] {
	const map = new Map<number, Citation>();
	for (const c of characters) {
		for (const r of c.rankings) {
			const score = getCitationScore(r.citation);
			if (score > 0 && !map.has(score)) map.set(score, r.citation);
		}
	}
	return Array.from(map.values()).sort((a, b) => getCitationScore(a) - getCitationScore(b));
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function getFullName(c: Pick<Character, 'first_name' | 'last_name'>): string {
	return `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || 'Unknown';
}

export function formatDate(dateStr: string | null): string {
	if (!dateStr) return '—';
	try {
		return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
			year: 'numeric', month: 'short', day: 'numeric',
		});
	} catch {
		return dateStr;
	}
}

export function formatProbability(favorable: number | null, total: number | null): string {
	if (!favorable || !total) return 'Unknown';
	return `${favorable.toLocaleString()} / ${total.toLocaleString()}`;
}

export function formatCooldown(totalEvents: number | null): string {
	if (!totalEvents) return '';
	const days = totalEvents / 100_000_000;
	if (days >= 1)        return `${days.toLocaleString()} day(s)`;
	if (days >= 1 / 24)   return `${(days * 24).toLocaleString()} hour(s)`;
	if (days >= 1 / 1440) return `${(days * 1440).toLocaleString()} minute(s)`;
	return `${(days * 86400).toLocaleString()} second(s)`;
}

// ─── Timeline helpers ─────────────────────────────────────────────────────────

const TZ_MAP: Record<string, string> = {
	JST: 'Asia/Tokyo',  EST: 'America/New_York',  CST: 'America/Chicago',
	MST: 'America/Denver', PST: 'America/Los_Angeles', UTC: 'UTC', GMT: 'UTC',
	CET: 'Europe/Paris', EET: 'Europe/Athens', IST: 'Asia/Kolkata',
	KST: 'Asia/Seoul',
};

export function getIANATimezone(tz: string | null): string {
	return TZ_MAP[tz ?? ''] ?? 'UTC';
}

export function getTimelineEventDate(ev: TimelineEvent): string {
	if (ev.date_label) return ev.date_label;
	const iana = getIANATimezone(ev.timezone);
	const date = new Date(ev.date_utc);
	if (ev.display_time) {
		const datePart = date.toLocaleDateString('en-US', { timeZone: iana, year: 'numeric', month: 'long', day: 'numeric' });
		const timePart = date.toLocaleTimeString('en-US', { timeZone: iana, hour: '2-digit', minute: '2-digit', hour12: false });
		return `${datePart} ${timePart} ${ev.timezone ?? ''}`.trim();
	}
	return date.toLocaleDateString('en-US', { timeZone: iana, year: 'numeric', month: 'long', day: 'numeric' });
}
