import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters, getOrbs, getDungeons } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;
	const [characters, orbs, dungeons] = await Promise.all([
		getCharacters(db),
		getOrbs(db),
		getDungeons(db),
	]);
	return { characters, orbs, dungeons };
};

export const actions: Actions = {
	submit: async ({ platform, locals, request }) => {
		const db   = platform!.env.DB;
		const user = locals.user!; // hooks guarantee auth on /contribute

		const form = await request.formData();
		const entityType   = form.get('entity_type')?.toString();
		const entityId     = form.get('entity_id')?.toString() || null;
		const operation    = form.get('operation')?.toString();
		const proposedData = form.get('proposed_data')?.toString();

		if (!entityType || !operation || !proposedData) {
			return fail(400, { error: 'Missing required fields' });
		}

		const validTypes = ['character', 'orb', 'timeline_event', 'dungeon',
			'character_stat', 'character_ranking', 'character_orb', 'orb_drop_rate'];
		const validOps = ['insert', 'update', 'delete'];

		if (!validTypes.includes(entityType) || !validOps.includes(operation)) {
			return fail(400, { error: 'Invalid entity type or operation' });
		}

		try {
			JSON.parse(proposedData);
		} catch {
			return fail(400, { error: 'proposed_data must be valid JSON' });
		}

		await db
			.prepare(
				`INSERT INTO pending_submissions (submitted_by, entity_type, entity_id, operation, proposed_data)
				 VALUES (?, ?, ?, ?, ?)`
			)
			.bind(user.id, entityType, entityId ? parseInt(entityId) : null, operation, proposedData)
			.run();

		return { success: true };
	},
};
