import type { PageServerLoad } from './$types';
import { getOrbs } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const orbs = await getOrbs(platform!.env.DB);
	return { orbs };
};
