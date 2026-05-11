import type { PageServerLoad } from './$types';
import { getMonsters } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const monsters = await getMonsters(platform!.env.DB);
	return { monsters };
};
