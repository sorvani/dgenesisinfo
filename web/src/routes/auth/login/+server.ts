import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createOAuthState } from '$lib/server/auth';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = platform?.env.DB!;

	const state    = await createOAuthState(db);
	const clientId = platform?.env.GITHUB_CLIENT_ID!;
	const origin   = url.origin;

	const params = new URLSearchParams({
		client_id:    clientId,
		redirect_uri: `${origin}/auth/callback`,
		scope:        'read:user',
		state,
	});

	redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};
