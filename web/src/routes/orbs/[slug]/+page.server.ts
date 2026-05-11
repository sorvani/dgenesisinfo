import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getOrbBySlug, getCharacters } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, params }) => {
	const db = platform!.env.DB;
	const [orb, characters] = await Promise.all([
		getOrbBySlug(db, params.slug),
		getCharacters(db),
	]);
	if (!orb) error(404, 'Orb not found');

	// Characters who have used this orb
	const users = characters.filter(c => c.orbs_used.some(o => o.orb_id === orb.id));
	return { orb, users };
};
