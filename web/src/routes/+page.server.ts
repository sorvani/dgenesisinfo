import type { PageServerLoad } from './$types';
import { getExplorers } from '$lib/server/data';
import { getRankSortValue, getHistoricalRankingAt, getAllUniqueRankingCitations } from '$lib/utils';

export const load: PageServerLoad = async ({ platform }) => {
	const db        = platform!.env.DB;
	const explorers = await getExplorers(db);

	// WDARL: only explorers flagged in_wdarl with at least one known exact rank
	const wdarl = explorers
		.filter(c => c.in_wdarl && c.rankings.some(r => r.rank !== null))
		.sort((a, b) => getRankSortValue(a.rankings) - getRankSortValue(b.rankings));

	const citations = getAllUniqueRankingCitations(wdarl);

	return { wdarl, citations };
};
