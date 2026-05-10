import type { PageServerLoad } from './$types';
import { getCharacters } from '$lib/server/data';
import { getRankSortValue } from '$lib/utils';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform!.env.DB;
	const characters = await getCharacters(db);
	return {
		characters: characters.sort((a, b) => getRankSortValue(a.rankings) - getRankSortValue(b.rankings)),
	};
};
