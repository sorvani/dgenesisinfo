import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDungeonBySlug } from '$lib/server/data';

interface OrbHere  { slug: string; orb_name: string; floor: string | null; }
interface BeastHere { slug: string; name: string; }

export const load: PageServerLoad = async ({ platform, params }) => {
	const db      = platform!.env.DB;
	const dungeon = await getDungeonBySlug(db, params.slug);
	if (!dungeon) error(404, 'Dungeon not found');

	const [orbRes, beastRes] = await db.batch([
		db.prepare(
			`SELECT DISTINCT o.slug, o.orb_name, odr.floor
			 FROM orb_drop_rates odr
			 JOIN orbs o ON o.id = odr.orb_id
			 WHERE odr.dungeon_id = ?
			 ORDER BY odr.floor, o.orb_name`
		).bind(dungeon.id),
		db.prepare(
			`SELECT DISTINCT m.slug, m.name
			 FROM orb_drop_rates odr
			 JOIN monsters m ON m.id = odr.monster_id
			 WHERE odr.dungeon_id = ?
			 ORDER BY m.name`
		).bind(dungeon.id),
	]);

	return {
		dungeon,
		orbs:    orbRes.results  as OrbHere[],
		beasts:  beastRes.results as BeastHere[],
	};
};
