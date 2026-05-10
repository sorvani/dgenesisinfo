// ─── Types ────────────────────────────────────────────────────────────────────

export interface Citation {
	volume:    string | null;
	chapter:   string | null;
	jnc_part:  string | null;
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
	moniker:          string | null;
	nationality:      string | null;
	date_first_known: string | null;
	is_public:        number;
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
	floor:              string | null;
	favorable_outcomes: number | null;
	total_events:       number | null;
	citation:           Citation;
}

export interface Orb {
	id:            number;
	slug:          string;
	orb_id:        number;
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
	country:         string | null;
	region:          string | null;
	discovered_date: string | null;
	floors:          number | null;
	is_active:       number;
	note:            string | null;
	citation:        Citation;
}

// ─── Citation helpers ─────────────────────────────────────────────────────────

export function getCitationScore(citation: Citation | null): number {
	if (!citation) return 0;
	const v = parseFloat(citation.volume   ?? '0') || 0;
	const c = parseFloat(citation.chapter  ?? '0') || 0;
	const p = parseFloat(citation.jnc_part ?? '0') || 0;
	return (v * 1_000_000) + (c * 1_000) + p;
}

export function formatCitation(citation: Citation | null): string {
	if (!citation) return '';
	const parts: string[] = [];
	if (citation.volume)   parts.push(`Vol ${citation.volume}`);
	if (citation.chapter)  parts.push(`Ch ${citation.chapter}`);
	if (citation.jnc_part) parts.push(`Part ${citation.jnc_part}`);
	return parts.join(' · ');
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

export function getNationalityFlag(code: string | null): string {
	if (!code || code.length !== 2) return '';
	const upper = code.toUpperCase();
	return String.fromCodePoint(...upper.split('').map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
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
