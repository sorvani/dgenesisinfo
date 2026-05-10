const SESSION_COOKIE = 'dgenesis.session';
const SESSION_DAYS   = 30;

// ── Token generation ──────────────────────────────────────────────────────────

export function generateToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ── Session management ────────────────────────────────────────────────────────

export async function createSession(
	db: D1Database,
	userId: number,
	opts: { ipAddress?: string; userAgent?: string } = {}
): Promise<string> {
	const token   = generateToken();
	const expires = new Date();
	expires.setDate(expires.getDate() + SESSION_DAYS);

	await db
		.prepare(
			`INSERT INTO sessions (token, user_id, expires_utc, ip_address, user_agent)
			 VALUES (?, ?, ?, ?, ?)`
		)
		.bind(token, userId, expires.toISOString(), opts.ipAddress ?? null, opts.userAgent ?? null)
		.run();

	return token;
}

export async function getSession(db: D1Database, token: string) {
	return db
		.prepare(
			`SELECT s.token, s.user_id, s.expires_utc,
			        u.github_id, u.github_username, u.is_admin
			 FROM sessions s
			 JOIN users u ON u.id = s.user_id
			 WHERE s.token = ? AND s.expires_utc > strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`
		)
		.bind(token)
		.first<SessionRow>();
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
	await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export async function touchUser(db: D1Database, userId: number): Promise<void> {
	await db
		.prepare(`UPDATE users SET last_seen_utc = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?`)
		.bind(userId)
		.run();
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function sessionCookieHeader(token: string): string {
	const expires = new Date();
	expires.setDate(expires.getDate() + SESSION_DAYS);
	return [
		`${SESSION_COOKIE}=${token}`,
		'Path=/',
		'HttpOnly',
		'Secure',
		'SameSite=Lax',
		`Expires=${expires.toUTCString()}`,
	].join('; ');
}

export function clearSessionCookieHeader(): string {
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function getSessionToken(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
	return match?.[1] ?? null;
}

// ── GitHub OAuth ──────────────────────────────────────────────────────────────

export async function createOAuthState(db: D1Database): Promise<string> {
	const state = generateToken();
	await db.prepare(`INSERT INTO oauth_states (state) VALUES (?)`).bind(state).run();
	return state;
}

export async function consumeOAuthState(db: D1Database, state: string): Promise<boolean> {
	const row = await db
		.prepare(
			`SELECT 1 FROM oauth_states
			 WHERE state = ? AND created_utc > datetime('now', '-10 minutes')`
		)
		.bind(state)
		.first();
	if (!row) return false;
	await db.prepare(`DELETE FROM oauth_states WHERE state = ?`).bind(state).run();
	return true;
}

export async function upsertGitHubUser(
	db: D1Database,
	githubId: number,
	githubUsername: string
): Promise<number> {
	await db
		.prepare(
			`INSERT INTO users (github_id, github_username)
			 VALUES (?, ?)
			 ON CONFLICT (github_id) DO UPDATE SET github_username = excluded.github_username`
		)
		.bind(githubId, githubUsername)
		.run();

	const row = await db
		.prepare(`SELECT id FROM users WHERE github_id = ?`)
		.bind(githubId)
		.first<{ id: number }>();

	return row!.id;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SessionRow {
	token:           string;
	user_id:         number;
	expires_utc:     string;
	github_id:       number;
	github_username: string;
	is_admin:        number;
}
