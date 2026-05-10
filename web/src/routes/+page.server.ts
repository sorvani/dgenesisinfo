import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;

	const [chars, orbs, timeline, stats] = await db.batch([
		db.prepare('SELECT COUNT(*) AS n FROM characters'),
		db.prepare('SELECT COUNT(*) AS n FROM orbs'),
		db.prepare('SELECT COUNT(*) AS n FROM timeline_events'),
		db.prepare('SELECT COUNT(*) AS n FROM character_stats'),
	]);

	return {
		stats: {
			characters: (chars.results[0]  as { n: number }).n,
			orbs:       (orbs.results[0]   as { n: number }).n,
			timeline:   (timeline.results[0] as { n: number }).n,
			stats:      (stats.results[0]  as { n: number }).n,
		},
	};
};
