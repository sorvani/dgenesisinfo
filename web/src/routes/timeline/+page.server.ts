import type { PageServerLoad } from './$types';
import { getTimelineEvents } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const events = await getTimelineEvents(platform!.env.DB);

	// Unique book sections in order
	const sections = ['pre-history', ...new Set(
		events
			.filter(e => !e.pre_history && e.cite_volume)
			.map(e => e.cite_volume!)
	)].filter(Boolean);

	return { events, sections };
};
