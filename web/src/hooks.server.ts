import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getSessionToken, getSession, touchUser } from '$lib/server/auth';

// Routes requiring a logged-in user (non-admin)
const AUTH_REQUIRED = ['/contribute'];
// Routes requiring admin
const ADMIN_REQUIRED = ['/admin'];

export const handle: Handle = async ({ event, resolve }) => {
	const db    = event.platform?.env.DB;
	const token = getSessionToken(event.request.headers.get('cookie'));

	event.locals.user = null;

	if (db && token) {
		const session = await getSession(db, token);
		if (session) {
			event.locals.user = {
				id:             session.user_id,
				githubId:       session.github_id,
				githubUsername: session.github_username,
				isAdmin:        session.is_admin === 1,
			};
			// Fire-and-forget last_seen update
			event.platform?.ctx.waitUntil(touchUser(db, session.user_id));
		}
	}

	const path = event.url.pathname;

	if (ADMIN_REQUIRED.some(p => path === p || path.startsWith(p + '/'))) {
		if (!event.locals.user?.isAdmin) {
			redirect(302, '/');
		}
	} else if (AUTH_REQUIRED.some(p => path === p || path.startsWith(p + '/'))) {
		if (!event.locals.user) {
			const returnTo = encodeURIComponent(path + event.url.search);
			redirect(302, `/auth/login?returnTo=${returnTo}`);
		}
	}

	return resolve(event);
};
