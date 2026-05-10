import type { PageServerLoad } from './$types';
import { getTimelineEvents } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const events = await getTimelineEvents(platform!.env.DB);
	return { events };
};
