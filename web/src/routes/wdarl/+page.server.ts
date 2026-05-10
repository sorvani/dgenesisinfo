import type { PageServerLoad } from './$types';
import { getCharacters } from '$lib/server/data';
import { getAllUniqueRankingCitations, getRankSortValue } from '$lib/utils';

export const load: PageServerLoad = async ({ platform }) => {
	const db         = platform!.env.DB;
	const characters = await getCharacters(db);
	const inWdarl    = characters.filter(c => c.in_wdarl);

	return {
		characters:  inWdarl.sort((a, b) => getRankSortValue(a.rankings) - getRankSortValue(b.rankings)),
		citations:   getAllUniqueRankingCitations(inWdarl),
	};
};
