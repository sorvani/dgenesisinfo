import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getCharacters, getOrbs, getDungeons } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, locals, url }) => {
	const db = platform!.env.DB;
	const [characters, orbs, dungeons] = await Promise.all([
		getCharacters(db),
		getOrbs(db),
		getDungeons(db),
	]);

	// Pre-fill from URL params
	const type    = url.searchParams.get('type')      ?? 'character';
	const op      = url.searchParams.get('op')        ?? 'insert';
	const entityId = url.searchParams.get('id')       ?? null;

	// If editing, fetch current data for the entity
	let prefill: string = '{}';
	if (op === 'update' && entityId) {
		const numId = parseInt(entityId);
		if (type === 'character') {
			const c = characters.find(c => c.id === numId);
			if (c) prefill = JSON.stringify({ first_name: c.first_name, last_name: c.last_name, monikers: c.monikers, nationality: c.nationality, birthday: c.birthday, sex: c.sex, area: c.area, note: c.note, tags: c.tags }, null, 2);
		} else if (type === 'orb') {
			const o = orbs.find(o => o.id === numId);
			if (o) prefill = JSON.stringify({ orb_name: o.orb_name, known_effects: o.known_effects, note: o.note }, null, 2);
		} else if (type === 'dungeon') {
			const d = dungeons.find(d => d.id === numId);
			if (d) prefill = JSON.stringify({ name: d.name, area: d.area, area_label: d.area_label, country: d.country, region: d.region, floors: d.floors, note: d.note }, null, 2);
		}
	}

	return { characters, orbs, dungeons, prefill, defaultType: type, defaultOp: op, defaultEntityId: entityId };
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

		const validTypes = ['character', 'orb', 'timeline_event', 'dungeon', 'monster',
			'character_stat', 'character_ranking', 'character_orb', 'orb_drop_rate'];
		const validOps = ['insert', 'update', 'delete'];

		if (!validTypes.includes(entityType) || !validOps.includes(operation)) return fail(400, { error: 'Invalid type or operation' });

		try { JSON.parse(proposedData); } catch { return fail(400, { error: 'proposed_data must be valid JSON' }); }

		await db.prepare(
			`INSERT INTO pending_submissions (submitted_by, entity_type, entity_id, operation, proposed_data)
			 VALUES (?, ?, ?, ?, ?)`
		).bind(user.id, entityType, entityId ? parseInt(entityId) : null, operation, proposedData).run();

		return { success: true };
	},
};
