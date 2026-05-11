import type { PageServerLoad } from './$types';
import { getTimelineEvents } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const events = await getTimelineEvents(platform!.env.DB);

	// Unique volumes in order (citation.volume, not cite_volume)
	const volumes = [...new Set(
		events
			.filter(e => !e.pre_history && e.citation.volume)
			.map(e => e.citation.volume!)
	)];

	return { events, volumes };
};
