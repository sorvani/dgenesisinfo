import explorersData from '@/data/explorers.json';
import orbsData from '@/data/orbs.json';
import timelineData from '@/data/timeline.json';

// ─── Types ───────────────────────────────────────────────────────────

export interface Citation {
  volume: string | null;
  chapter: string | null;
  jnc_part: string | null;
}

export interface Ranking {
  rank: number;
  known_above_rank: number | null;
  date_noted: string | null;
  citation: Citation | null;
}

export interface Stat {
  date_noted: string | null;
  date_sequence: number | null;
  scan_type: string | null;
  sp: number | null;
  hp: number | null;
  mp: number | null;
  str: number | null;
  vit: number | null;
  int: number | null;
  agi: number | null;
  dex: number | null;
  luc: number | null;
  stat_total: number | null;
  points_from_average: number | null;
  citation: Citation | null;
}

export interface OrbUsed {
  orb_id: number | null;
  date_acquired: string | null;
  date_note: string | null;
  citation: Citation | null;
}

export interface Explorer {
  slug: string;
  first_name: string | null;
  last_name: string | null;
  moniker: string | null;
  nationality: string | null;
  date_first_known: string | null;
  public: boolean;
  area: number | null;
  birthday: string | null;
  sex: string | null;
  note: string | null;
  rankings: Ranking[];
  stats: Stat[];
  orbs_used: OrbUsed[];
}

export interface DropRate {
  creature: string | null;
  dungeon: string | null;
  floor: string | null;
  favorable_outcomes: number | null;
  total_events: number | null;
  citation: Citation | null;
}

export interface Orb {
  slug: string;
  orb_id: number | null;
  orb_name: string | null;
  known_effects: string | null;
  note: string | null;
  drop_rates: DropRate[];
}

export interface TimelineEvent {
  id: number;
  date_utc: string;
  date_label: string | null;
  display_time: boolean;
  timezone: string;
  pre_history?: boolean;
  event: string;
  citation: Citation | null;
}

// ─── Data Access ─────────────────────────────────────────────────────

const explorers: Explorer[] = explorersData as Explorer[];
const orbs: Orb[] = orbsData as Orb[];
const timeline: TimelineEvent[] = timelineData as TimelineEvent[];

/** Get latest rank value for sorting (lower = better) */
function getLatestRankValue(explorer: Explorer): number {
  if (!explorer.rankings || explorer.rankings.length === 0) return Infinity;
  const sorted = [...explorer.rankings].reverse().sort((a, b) => {
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    return dateB - dateA;
  });
  const latest = sorted[0];
  if (latest.rank && latest.rank !== 0) return latest.rank;
  if (latest.known_above_rank) return latest.known_above_rank - 1;
  return Infinity;
}

/** Get all explorers sorted by current rank */
export function getExplorers(): Explorer[] {
  return [...explorers].sort((a, b) => getLatestRankValue(a) - getLatestRankValue(b));
}

/** Get a single explorer by slug */
export function getExplorerBySlug(slug: string): Explorer | undefined {
  return explorers.find(e => e.slug === slug);
}

/** Get all orbs sorted alphabetically */
export function getOrbs(): Orb[] {
  return [...orbs].sort((a, b) => {
    // Force "Making" to be first using its exact slug
    if (a.slug === 'making') return -1;
    if (b.slug === 'making') return 1;

    const nameA = (a.orb_name || '').toLowerCase();
    const nameB = (b.orb_name || '').toLowerCase();
    
    return nameA.localeCompare(nameB);
  });
}

/** Get a single orb by slug */
export function getOrbBySlug(slug: string): Orb | undefined {
  return orbs.find(o => o.slug === slug);
}

/** Find an orb by its numeric orb_id */
export function getOrbById(orbId: number): Orb | undefined {
  return orbs.find(o => o.orb_id === orbId);
}

/** Get all timeline events sorted by date_utc then id */
export function getTimelineEvents(): TimelineEvent[] {
  return [...timeline].sort((a, b) => {
    const dateA = new Date(a.date_utc).getTime();
    const dateB = new Date(b.date_utc).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.id - b.id;
  });
}

/** Get unique book numbers from timeline */
export function getTimelineBooks(): number[] {
  const books = new Set(timeline.map(e => e.pre_history ? 0 : Number(e.citation?.volume || 0)));
  return Array.from(books).sort((a, b) => a - b);
}

// ─── Timezone Helpers ────────────────────────────────────────────────

/** Map of timezone abbreviations to IANA timezone identifiers */
const TZ_MAP: Record<string, string> = {
  JST: 'Asia/Tokyo',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  UTC: 'UTC',
  GMT: 'UTC',
  CET: 'Europe/Paris',
  EET: 'Europe/Athens',
  IST: 'Asia/Kolkata',
  KST: 'Asia/Seoul',
  CST_CN: 'Asia/Shanghai',
};

/** Get IANA timezone from abbreviation */
export function getIANATimezone(tz: string): string {
  return TZ_MAP[tz] || 'Asia/Tokyo';
}

/** Format a UTC date for display in the given timezone, date-only */
export function formatTimelineDate(dateUtc: string, timezone: string): string {
  const date = new Date(dateUtc);
  const iana = getIANATimezone(timezone);
  return date.toLocaleDateString('en-US', {
    timeZone: iana,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format a UTC date for display in the given timezone, with time */
export function formatTimelineDateTime(dateUtc: string, timezone: string): string {
  const date = new Date(dateUtc);
  const iana = getIANATimezone(timezone);
  const datePart = date.toLocaleDateString('en-US', {
    timeZone: iana,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    timeZone: iana,
    hour: '2-digit',
    minute: '2-digit',
    second: date.getUTCSeconds() > 0 ? '2-digit' : undefined,
    hour12: false,
  });
  return `${datePart} ${timePart} ${timezone}`;
}

/** Get the display string for a timeline event */
export function getTimelineEventDate(event: TimelineEvent): string {
  if (event.date_label) return event.date_label;
  if (event.display_time) return formatTimelineDateTime(event.date_utc, event.timezone);
  return formatTimelineDate(event.date_utc, event.timezone);
}

/** Get the book label */
export function getBookLabel(book: number): string {
  if (book === 0) return 'Pre-History';
  return `Book ${book}`;
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Format citation as readable string */
export function formatCitation(citation: Citation | null): string {
  if (!citation) return '';
  const parts: string[] = [];
  if (citation.volume) parts.push(`Vol ${citation.volume}`);
  if (citation.chapter) parts.push(`Ch ${citation.chapter}`);
  if (citation.jnc_part) parts.push(`Part ${citation.jnc_part}`);
  return parts.join(' · ') || '';
}

/** Format date for display */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Calculate a comparable numeric score from a citation (e.g. Vol 1, Ch 2, Part 3 = 1,002,003) */
export function getCitationScore(citation: Citation | null): number {
  if (!citation) return 0;
  const v = parseFloat(citation.volume || '0') || 0;
  const c = parseFloat(citation.chapter || '0') || 0;
  const p = parseFloat(citation.jnc_part || '0') || 0;
  return (v * 1000000) + (c * 1000) + p;
}

/** Get all unique citations attached to rankings across all explorers, sorted chronologically */
export function getAllUniqueRankingCitations(): Citation[] {
  const map = new Map<number, Citation>();
  explorers.forEach(ex => {
    ex.rankings.forEach(r => {
      const score = getCitationScore(r.citation);
      if (score > 0 && !map.has(score)) {
        map.set(score, r.citation as Citation);
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => getCitationScore(a) - getCitationScore(b));
}

/** Get the latest ranking for an explorer at or before a maximum citation score */
export function getHistoricalRankingAt(explorer: Explorer, maxScore: number | null = null): Ranking | null {
  if (!explorer.rankings || explorer.rankings.length === 0) return null;
  
  let validRankings = [...explorer.rankings];
  if (maxScore !== null) {
    validRankings = validRankings.filter(r => getCitationScore(r.citation) <= maxScore);
  }
  
  if (validRankings.length === 0) return null;
  
  // Sort descending by score primarily, then date
  return validRankings.sort((a, b) => {
    const scoreA = getCitationScore(a.citation);
    const scoreB = getCitationScore(b.citation);
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // Fallback date sort if citations perfectly match or are 0
    const dateA = a.date_noted ? new Date(a.date_noted).getTime() : 0;
    const dateB = b.date_noted ? new Date(b.date_noted).getTime() : 0;
    return dateB - dateA;
  })[0];
}

/** Get rank value specifically for sorting (lower = better), factoring in history limit */
export function getHistoricalRankValueAt(explorer: Explorer, maxScore: number | null = null): number {
  const latest = getHistoricalRankingAt(explorer, maxScore);
  if (!latest) return Infinity; // unranked
  if (latest.rank && latest.rank !== 0) return latest.rank;
  if (latest.known_above_rank) return latest.known_above_rank - 1;
  return Infinity;
}

/** Get the latest ranking for an explorer */
export function getLatestRanking(explorer: Explorer): Ranking | null {
  return getHistoricalRankingAt(explorer, null);
}

/** Format rank for display */
export function formatRank(ranking: Ranking | null): string {
  if (!ranking) return 'Unknown';
  if (ranking.rank && ranking.rank !== 0) return ranking.rank.toLocaleString();
  if (ranking.known_above_rank) return `Above ${ranking.known_above_rank.toLocaleString()}`;
  return 'Unknown';
}

/** Format explorer full name */
export function getFullName(explorer: Explorer): string {
  return `${explorer.first_name || ''} ${explorer.last_name || ''}`.trim() || 'Unknown';
}

/** Get nationality flag emoji from country code */
export function getNationalityFlag(code: string | null): string {
  if (!code) return '';
  const upper = code.toUpperCase();
  // Convert 2-letter country code to flag emoji
  if (upper.length === 2) {
    return String.fromCodePoint(
      ...upper.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
  }
  return code;
}

/** Format cooldown from total_events */
export function formatCooldown(totalEvents: number | null): string {
  if (!totalEvents) return '';
  const days = totalEvents / 100000000;
  if (days >= 1) return `${days.toLocaleString()} day(s)`;
  if (days >= 1 / 24) return `${(days * 24).toLocaleString()} hour(s)`;
  if (days >= 1 / 1440) return `${(days * 1440).toLocaleString()} minute(s)`;
  return `${(days * 86400).toLocaleString()} second(s)`;
}

/** Format probability from favorable_outcomes / total_events */
export function formatProbability(favorable: number | null, total: number | null): string {
  if (!favorable || !total) return 'Unknown';
  return `${favorable.toLocaleString()} / ${total.toLocaleString()}`;
}
