import type { PageServerLoad } from './$types';
import { getNonExplorers } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const characters = await getNonExplorers(platform!.env.DB);
	return { characters };
};
