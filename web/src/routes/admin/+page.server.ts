import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

interface SubmissionRow {
	id:            number;
	submitted_by:  number;
	submitted_at:  string;
	entity_type:   string;
	entity_id:     number | null;
	operation:     string;
	proposed_data: string;
	status:        string;
	reviewed_by:   number | null;
	reviewed_at:   string | null;
	admin_note:    string | null;
	github_username: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;

	const [pendingRes, recentRes] = await db.batch([
		db.prepare(
			`SELECT s.*, u.github_username
			 FROM pending_submissions s
			 JOIN users u ON u.id = s.submitted_by
			 WHERE s.status = 'pending'
			 ORDER BY s.submitted_at ASC`
		),
		db.prepare(
			`SELECT s.*, u.github_username
			 FROM pending_submissions s
			 JOIN users u ON u.id = s.submitted_by
			 WHERE s.status != 'pending'
			 ORDER BY s.reviewed_at DESC
			 LIMIT 20`
		),
	]);

	return {
		pending: pendingRes.results  as SubmissionRow[],
		recent:  recentRes.results   as SubmissionRow[],
	};
};

export const actions: Actions = {
	approve: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const user = locals.user!;
		const form = await request.formData();
		const id   = parseInt(form.get('id')?.toString() ?? '');
		const note = form.get('admin_note')?.toString() ?? null;

		if (!id) return fail(400, { error: 'Missing submission ID' });

		await db
			.prepare(
				`UPDATE pending_submissions
				 SET status = 'approved', reviewed_by = ?, reviewed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), admin_note = ?
				 WHERE id = ? AND status = 'pending'`
			)
			.bind(user.id, note, id)
			.run();

		return { success: true };
	},

	reject: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const user = locals.user!;
		const form = await request.formData();
		const id   = parseInt(form.get('id')?.toString() ?? '');
		const note = form.get('admin_note')?.toString() ?? null;

		if (!id) return fail(400, { error: 'Missing submission ID' });

		await db
			.prepare(
				`UPDATE pending_submissions
				 SET status = 'rejected', reviewed_by = ?, reviewed_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), admin_note = ?
				 WHERE id = ? AND status = 'pending'`
			)
			.bind(user.id, note, id)
			.run();

		return { success: true };
	},
};
