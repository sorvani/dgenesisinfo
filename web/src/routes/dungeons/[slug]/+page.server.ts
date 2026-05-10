import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDungeonBySlug } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, params }) => {
	const dungeon = await getDungeonBySlug(platform!.env.DB, params.slug);
	if (!dungeon) error(404, 'Dungeon not found');
	return { dungeon };
};
