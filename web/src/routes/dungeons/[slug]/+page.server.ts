import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDungeonBySlug, getDungeonMonsters } from '$lib/server/data';

interface OrbHere { slug: string; orb_name: string; floor: string | null; }

export const load: PageServerLoad = async ({ platform, params }) => {
	const db      = platform!.env.DB;
	const dungeon = await getDungeonBySlug(db, params.slug);
	if (!dungeon) error(404, 'Dungeon not found');

	const [orbRes, creatures] = await Promise.all([
		db.prepare(
			`SELECT DISTINCT o.slug, o.orb_name, odr.floor
			 FROM orb_drop_rates odr
			 JOIN orbs o ON o.id = odr.orb_id
			 WHERE odr.dungeon_id = ?
			 ORDER BY odr.floor, o.orb_name`
		).bind(dungeon.id).all<OrbHere>(),
		getDungeonMonsters(db, dungeon.id),
	]);

	return {
		dungeon,
		orbs:      orbRes.results as OrbHere[],
		creatures,
	};
};
