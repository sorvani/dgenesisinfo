import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters, getOrbs, getDungeons, getMonsters } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, url }) => {
	const db = platform!.env.DB;
	const [characters, orbs, dungeons, monsters] = await Promise.all([
		getCharacters(db),
		getOrbs(db),
		getDungeons(db),
		getMonsters(db),
	]);

	return {
		characters,
		orbs,
		dungeons,
		monsters,
		defaultType:     url.searchParams.get('type')  ?? 'character',
		defaultOp:       url.searchParams.get('op')    ?? 'insert',
		defaultEntityId: url.searchParams.get('id')    ? parseInt(url.searchParams.get('id')!) : null,
	};
};

export const actions: Actions = {
	submit: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const user = locals.user!;
		const form = await request.formData();

		const entityType   = form.get('entity_type')?.toString();
		const entityId     = form.get('entity_id')?.toString() || null;
		const operation    = form.get('operation')?.toString();
		const proposedData = form.get('proposed_data')?.toString();

		if (!entityType || !operation || !proposedData) return fail(400, { error: 'Missing required fields' });

		try { JSON.parse(proposedData); } catch { return fail(400, { error: 'Invalid JSON in proposed data' }); }

		await db.prepare(
			`INSERT INTO pending_submissions (submitted_by, entity_type, entity_id, operation, proposed_data)
			 VALUES (?, ?, ?, ?, ?)`
		).bind(user.id, entityType, entityId ? parseInt(entityId) : null, operation, proposedData).run();

		return { success: true };
	},
};
