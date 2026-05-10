import type { PageServerLoad } from './$types';
import { getCharacters, getOrbs, getTimelineEvents } from '$lib/server/data';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;
	const [characters, orbs, timeline] = await Promise.all([
		getCharacters(db),
		getOrbs(db),
		getTimelineEvents(db),
	]);

	return {
		stats: {
			characters: characters.length,
			orbs:       orbs.length,
			timeline:   timeline.length,
			stats:      characters.reduce((n, c) => n + c.stats.length, 0),
		},
	};
};
