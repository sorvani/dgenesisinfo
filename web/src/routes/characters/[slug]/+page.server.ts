import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getCharacterBySlug, getOrbs } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, params }) => {
	const db = platform!.env.DB;
	const [character, orbs] = await Promise.all([
		getCharacterBySlug(db, params.slug),
		getOrbs(db),
	]);
	if (!character) error(404, 'Character not found');
	return { character, orbs };
};
