import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getMonsterBySlug } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform, params }) => {
	const result = await getMonsterBySlug(platform!.env.DB, params.slug);
	if (!result) error(404, 'Monster not found');
	return result;
};
