import type { RequestHandler } from '@sveltejs/kit';
import { redirect, error } from '@sveltejs/kit';
import {
	consumeOAuthState,
	upsertGitHubUser,
	createSession,
	sessionCookieHeader,
} from '$lib/server/auth';

export const GET: RequestHandler = async ({ platform, url, request }) => {
	const db           = platform?.env.DB!;
	const clientId     = platform?.env.GITHUB_CLIENT_ID!;
	const clientSecret = platform?.env.GITHUB_CLIENT_SECRET!;

	const code      = url.searchParams.get('code');
	const state     = url.searchParams.get('state');
	const returnTo  = url.searchParams.get('returnTo') ?? '/';

	if (!code || !state) error(400, 'Missing code or state');

	const stateValid = await consumeOAuthState(db, state);
	if (!stateValid) error(400, 'Invalid or expired OAuth state');

	// Exchange code for access token
	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id:     clientId,
			client_secret: clientSecret,
			code,
			redirect_uri:  `${url.origin}/auth/callback`,
		}),
	});

	const tokenData = await tokenRes.json<{ access_token?: string; error?: string }>();
	if (!tokenData.access_token) error(502, 'GitHub token exchange failed');

	// Fetch GitHub user profile
	const userRes = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
			Accept:        'application/vnd.github+json',
			'User-Agent':  'dgenesisinfo',
		},
	});

	if (!userRes.ok) error(502, 'Failed to fetch GitHub user');
	const ghUser = await userRes.json<{ id: number; login: string }>();

	const userId = await upsertGitHubUser(db, ghUser.id, ghUser.login);
	const token  = await createSession(db, userId, {
		ipAddress: request.headers.get('cf-connecting-ip') ?? undefined,
		userAgent: request.headers.get('user-agent') ?? undefined,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location:   decodeURIComponent(returnTo),
			'Set-Cookie': sessionCookieHeader(token),
		},
	});
};
