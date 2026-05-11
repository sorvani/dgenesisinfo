import type { PageServerLoad } from './$types';
import { getDungeons } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const dungeons = await getDungeons(platform!.env.DB);
	return { dungeons };
};
