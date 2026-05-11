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

	const entityType    = url.searchParams.get('type') ?? 'character';
	const operation     = url.searchParams.get('op')   ?? 'insert';
	const entityIdParam = url.searchParams.get('id');
	const entityId      = entityIdParam ? parseInt(entityIdParam) : null;
	const charIdParam   = url.searchParams.get('char_id');
	const charId        = charIdParam ? parseInt(charIdParam) : null;
	const monsterIdParam = url.searchParams.get('monster_id');
	const monsterId      = monsterIdParam ? parseInt(monsterIdParam) : null;
	const dungeonIdParam = url.searchParams.get('dungeon_id');
	const dungeonId      = dungeonIdParam ? parseInt(dungeonIdParam) : null;

	// For update of character sub-records, load the specific row so the form can prefill.
	// (getCharacters does not load per-character stats; rankings/orbs are loaded but
	// fetching by id is simpler than walking the list.)
	let prefillRow: Record<string, unknown> | null = null;
	if (operation === 'update' && entityId) {
		const table =
			entityType === 'character_ranking' ? 'character_rankings' :
			entityType === 'character_stat'    ? 'character_stats'    :
			entityType === 'character_orb'     ? 'character_orbs'     :
			entityType === 'timeline_event'    ? 'timeline_events'    :
			entityType === 'monster_dungeon'   ? 'monster_dungeons'   : null;
		if (table) {
			prefillRow = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(entityId).first();
		}
	}

	return {
		characters,
		orbs,
		dungeons,
		monsters,
		defaultType:     entityType,
		defaultOp:       operation,
		defaultEntityId:  entityId,
		defaultCharId:    charId,
		defaultMonsterId: monsterId,
		defaultDungeonId: dungeonId,
		prefillRow,
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
