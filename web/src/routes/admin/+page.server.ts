import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

interface RawSubmission {
	id: number; submitted_by: number; submitted_at: string;
	entity_type: string; entity_id: number | null; operation: string;
	proposed_data: string; status: string;
	reviewed_by: number | null; reviewed_at: string | null; admin_note: string | null;
	github_username: string;
}

const TABLE_MAP: Record<string, string> = {
	character:         'characters',
	orb:               'orbs',
	dungeon:           'dungeons',
	monster:           'monsters',
	timeline_event:    'timeline_events',
	character_stat:    'character_stats',
	character_ranking: 'character_rankings',
	character_orb:     'character_orbs',
	orb_drop_rate:     'orb_drop_rates',
};

const TABLES_WITH_MODIFIED = new Set(['characters', 'orbs', 'dungeons', 'monsters']);

const DIRECT_FIELDS: Record<string, string[]> = {
	character:         ['first_name', 'last_name', 'nationality', 'sex', 'birthday', 'date_first_known', 'area', 'is_explorer', 'in_wdarl', 'is_public', 'note'],
	orb:               ['orb_name', 'known_effects', 'note'],
	dungeon:           ['name', 'area', 'area_label', 'country', 'region', 'floors', 'is_active', 'note'],
	monster:           ['name', 'category', 'note'],
	timeline_event:    ['date_utc', 'date_label', 'display_time', 'timezone', 'pre_history', 'event'],
	character_stat:    ['character_id', 'date_noted', 'date_sequence', 'scan_type', 'hp', 'mp', 'sp', 'str', 'vit', 'int', 'agi', 'dex', 'luc', 'stat_total', 'points_from_avg'],
	character_ranking: ['character_id', 'rank', 'known_above_rank', 'date_noted'],
	character_orb:     ['character_id', 'orb_id', 'date_acquired', 'date_note'],
	orb_drop_rate:     ['orb_id', 'creature', 'dungeon', 'floor', 'favorable_outcomes', 'total_events'],
};

function flattenProposed(entityType: string, proposed: Record<string, unknown>): Record<string, unknown> {
	const flat: Record<string, unknown> = {};

	// Direct scalar fields
	for (const field of (DIRECT_FIELDS[entityType] ?? [])) {
		if (field in proposed) flat[field] = proposed[field];
	}

	// Character: monikers and tags stored as JSON arrays
	if (entityType === 'character') {
		if ('monikers' in proposed) flat.moniker = JSON.stringify(proposed.monikers ?? []);
		if ('tags' in proposed)     flat.tags     = JSON.stringify(proposed.tags ?? []);
	}

	// Citation fields
	if (proposed.citation) {
		const c = proposed.citation as Record<string, unknown>;
		if (entityType === 'character') {
			flat.cite_first_known_volume      = c.volume;
			flat.cite_first_known_chapter     = c.chapter;
			flat.cite_first_known_jnc_part    = c.jnc_part;
			flat.cite_first_known_source_type = c.source_type;
		} else {
			flat.cite_volume      = c.volume;
			flat.cite_chapter     = c.chapter;
			flat.cite_jnc_part    = c.jnc_part;
			flat.cite_source_type = c.source_type;
		}
	}

	return flat;
}

async function applySubmission(db: D1Database, sub: RawSubmission): Promise<void> {
	const table = TABLE_MAP[sub.entity_type];
	if (!table) return;

	if (sub.operation === 'delete') {
		if (!sub.entity_id) return;
		await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(sub.entity_id).run();
		return;
	}

	const proposed = JSON.parse(sub.proposed_data) as Record<string, unknown>;
	const flat = flattenProposed(sub.entity_type, proposed);

	if (sub.operation === 'update') {
		if (!sub.entity_id) return;
		if (TABLES_WITH_MODIFIED.has(table)) flat.modified_utc = new Date().toISOString().replace('T', 'T').split('.')[0] + 'Z';
		const cols = Object.keys(flat);
		if (!cols.length) return;
		const sql = `UPDATE ${table} SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`;
		await db.prepare(sql).bind(...Object.values(flat), sub.entity_id).run();
		return;
	}

	if (sub.operation === 'insert') {
		const cols = Object.keys(flat);
		if (!cols.length) return;
		const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`;
		await db.prepare(sql).bind(...Object.values(flat)).run();
		return;
	}
}

// Reshape a raw DB row into the same structure as proposed_data so diffs are meaningful
function normalizeCurrentForDiff(entityType: string, row: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};

	// Copy direct fields
	for (const field of (DIRECT_FIELDS[entityType] ?? [])) {
		if (field in row) out[field] = row[field];
	}

	// Character: monikers stored as JSON string under 'moniker', tags as JSON string
	if (entityType === 'character') {
		out.monikers = JSON.parse((row.moniker as string) || '[]');
		out.tags = JSON.parse((row.tags as string) || '[]');
		out.citation = {
			volume:      row.cite_first_known_volume      ?? null,
			chapter:     row.cite_first_known_chapter     ?? null,
			jnc_part:    row.cite_first_known_jnc_part    ?? null,
			source_type: row.cite_first_known_source_type ?? null,
		};
	} else {
		// All other entity types with standard cite_ columns
		if ('cite_volume' in row) {
			out.citation = {
				volume:      row.cite_volume      ?? null,
				chapter:     row.cite_chapter     ?? null,
				jnc_part:    row.cite_jnc_part    ?? null,
				source_type: row.cite_source_type ?? null,
			};
		}
	}

	return out;
}

async function resolveEntityLabel(db: D1Database, type: string, entityId: number | null, proposed: Record<string, unknown>): Promise<string | null> {
	switch (type) {
		case 'character': {
			const first = proposed.first_name as string | null;
			const last  = proposed.last_name  as string | null;
			if (first || last) return [first, last].filter(Boolean).join(' ');
			if (entityId) {
				const row = await db.prepare('SELECT first_name, last_name FROM characters WHERE id = ?').bind(entityId).first<{ first_name: string | null; last_name: string | null }>();
				return row ? [row.first_name, row.last_name].filter(Boolean).join(' ') || null : null;
			}
			return null;
		}
		case 'orb':
			return (proposed.orb_name as string) || null;
		case 'dungeon':
		case 'monster':
			return (proposed.name as string) || null;
		case 'timeline_event': {
			const ev = proposed.event as string | null;
			return ev ? ev.replace(/<[^>]*>/g, '').slice(0, 60) : null;
		}
		case 'character_stat':
		case 'character_ranking':
		case 'character_orb': {
			const charId = (proposed.character_id as number | null) ?? (
				entityId ? (await db.prepare(`SELECT character_id FROM ${TABLE_MAP[type]} WHERE id = ?`).bind(entityId).first<{ character_id: number }>())?.character_id ?? null : null
			);
			if (!charId) return null;
			const row = await db.prepare('SELECT first_name, last_name FROM characters WHERE id = ?').bind(charId).first<{ first_name: string | null; last_name: string | null }>();
			return row ? [row.first_name, row.last_name].filter(Boolean).join(' ') || null : null;
		}
		case 'orb_drop_rate': {
			const orbId = (proposed.orb_id as number | null) ?? (
				entityId ? (await db.prepare('SELECT orb_id FROM orb_drop_rates WHERE id = ?').bind(entityId).first<{ orb_id: number }>())?.orb_id ?? null : null
			);
			if (!orbId) return null;
			const row = await db.prepare('SELECT orb_name FROM orbs WHERE id = ?').bind(orbId).first<{ orb_name: string }>();
			return row?.orb_name ?? null;
		}
		default:
			return null;
	}
}

// Fetch current state of an entity so we can diff it
async function resolveCurrentEntity(db: D1Database, type: string, id: number | null): Promise<Record<string, unknown> | null> {
	if (!id) return null;
	const table = TABLE_MAP[type];
	if (!table) return null;
	const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Record<string, unknown>>();
	if (!row) return null;
	return normalizeCurrentForDiff(type, row);
}

export interface Submission {
	id: number; submitted_by: number; submitted_at: string;
	entity_type: string; entity_id: number | null; operation: string;
	proposed: Record<string, unknown>;
	current: Record<string, unknown> | null;
	entity_label: string | null;
	status: string;
	reviewed_by: number | null; reviewed_at: string | null; admin_note: string | null;
	github_username: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;

	const [pendingRes, recentRes] = await db.batch([
		db.prepare(
			`SELECT s.*, u.github_username FROM pending_submissions s
			 JOIN users u ON u.id = s.submitted_by
			 WHERE s.status = 'pending' ORDER BY s.submitted_at ASC`
		),
		db.prepare(
			`SELECT s.*, u.github_username FROM pending_submissions s
			 JOIN users u ON u.id = s.submitted_by
			 WHERE s.status != 'pending' ORDER BY s.reviewed_at DESC LIMIT 20`
		),
	]);

	const pending: Submission[] = await Promise.all(
		(pendingRes.results as RawSubmission[]).map(async s => {
			const proposed = JSON.parse(s.proposed_data);
			const [current, entity_label] = await Promise.all([
				resolveCurrentEntity(db, s.entity_type, s.entity_id),
				resolveEntityLabel(db, s.entity_type, s.entity_id, proposed),
			]);
			return { ...s, proposed, current, entity_label };
		})
	);

	const recent: Submission[] = await Promise.all(
		(recentRes.results as RawSubmission[]).map(async s => {
			const proposed = JSON.parse(s.proposed_data);
			const entity_label = await resolveEntityLabel(db, s.entity_type, s.entity_id, proposed);
			return { ...s, proposed, current: null, entity_label };
		})
	);

	return { pending, recent };
};

export const actions: Actions = {
	approve: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const form = await request.formData();
		const id   = parseInt(form.get('id')?.toString() ?? '');
		const note = form.get('admin_note')?.toString() ?? null;
		if (!id) return fail(400, { error: 'Missing ID' });

		const sub = await db.prepare(`SELECT * FROM pending_submissions WHERE id = ? AND status = 'pending'`).bind(id).first<RawSubmission>();
		if (!sub) return fail(404, { error: 'Submission not found or already reviewed' });

		await applySubmission(db, sub);

		await db.prepare(
			`UPDATE pending_submissions SET status='approved', reviewed_by=?, reviewed_at=strftime('%Y-%m-%dT%H:%M:%SZ','now'), admin_note=?
			 WHERE id=?`
		).bind(locals.user!.id, note, id).run();

		return { success: true };
	},
	reject: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const form = await request.formData();
		const id   = parseInt(form.get('id')?.toString() ?? '');
		const note = form.get('admin_note')?.toString() ?? null;
		if (!id) return fail(400, { error: 'Missing ID' });
		await db.prepare(
			`UPDATE pending_submissions SET status='rejected', reviewed_by=?, reviewed_at=strftime('%Y-%m-%dT%H:%M:%SZ','now'), admin_note=?
			 WHERE id=? AND status='pending'`
		).bind(locals.user!.id, note, id).run();
		return { success: true };
	},
};
