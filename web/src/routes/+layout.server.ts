import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	let pendingCount = 0;
	if (locals.user?.isAdmin) {
		const db = platform?.env.DB;
		if (db) {
			const row = await db.prepare("SELECT COUNT(*) AS n FROM pending_submissions WHERE status = 'pending'").first<{ n: number }>();
			pendingCount = row?.n ?? 0;
		}
	}
	return { user: locals.user, pendingCount };
};
