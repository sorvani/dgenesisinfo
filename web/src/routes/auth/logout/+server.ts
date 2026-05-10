import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getSessionToken, deleteSession, clearSessionCookieHeader } from '$lib/server/auth';

export const POST: RequestHandler = async ({ platform, request }) => {
	const db    = platform?.env.DB!;
	const token = getSessionToken(request.headers.get('cookie'));

	if (token) await deleteSession(db, token);

	return new Response(null, {
		status: 302,
		headers: {
			Location:     '/',
			'Set-Cookie': clearSessionCookieHeader(),
		},
	});
};
