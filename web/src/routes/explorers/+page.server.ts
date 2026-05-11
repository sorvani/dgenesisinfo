import type { PageServerLoad } from './$types';
import { getExplorers } from '$lib/server/data';
import { getRankSortValue } from '$lib/utils';

export const load: PageServerLoad = async ({ platform }) => {
	const explorers = await getExplorers(platform!.env.DB);
	return {
		explorers: explorers.sort((a, b) => getRankSortValue(a.rankings) - getRankSortValue(b.rankings)),
	};
};
