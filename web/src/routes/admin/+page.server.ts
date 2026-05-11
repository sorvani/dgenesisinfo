import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

interface RawSubmission {
	id: number; submitted_by: number; submitted_at: string;
	entity_type: string; entity_id: number | null; operation: string;
	proposed_data: string; status: string;
	reviewed_by: number | null; reviewed_at: string | null; admin_note: string | null;
	github_username: string;
}

// Fetch current state of an entity so we can diff it
async function resolveCurrentEntity(db: D1Database, type: string, id: number | null): Promise<Record<string, unknown> | null> {
	if (!id) return null;

	const tableMap: Record<string, string> = {
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

	const table = tableMap[type];
	if (!table) return null;

	const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Record<string, unknown>>();
	return row ?? null;
}

export interface Submission {
	id: number; submitted_by: number; submitted_at: string;
	entity_type: string; entity_id: number | null; operation: string;
	proposed: Record<string, unknown>;
	current: Record<string, unknown> | null;
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

	// Resolve current entity data for each pending submission
	const pending: Submission[] = await Promise.all(
		(pendingRes.results as RawSubmission[]).map(async s => ({
			...s,
			proposed: JSON.parse(s.proposed_data),
			current: await resolveCurrentEntity(db, s.entity_type, s.entity_id),
		}))
	);

	const recent: Submission[] = (recentRes.results as RawSubmission[]).map(s => ({
		...s,
		proposed: JSON.parse(s.proposed_data),
		current: null,
	}));

	return { pending, recent };
};

export const actions: Actions = {
	approve: async ({ platform, locals, request }) => {
		const db = platform!.env.DB;
		const form = await request.formData();
		const id   = parseInt(form.get('id')?.toString() ?? '');
		const note = form.get('admin_note')?.toString() ?? null;
		if (!id) return fail(400, { error: 'Missing ID' });
		await db.prepare(
			`UPDATE pending_submissions SET status='approved', reviewed_by=?, reviewed_at=strftime('%Y-%m-%dT%H:%M:%SZ','now'), admin_note=?
			 WHERE id=? AND status='pending'`
		).bind(locals.user!.id, note, id).run();
		return { success: true };
	},
	reject: async ({ platform, locals, request }) => {
		const db = platform!.env.DB;
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
