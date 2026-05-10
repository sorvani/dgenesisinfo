declare global {
	namespace Cloudflare {
		interface Env {
			GITHUB_CLIENT_ID:     string;
			GITHUB_CLIENT_SECRET: string;
			SESSION_SECRET:       string;
		}
	}

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			user: {
				id: number;
				githubUsername: string;
				githubId: number;
				isAdmin: boolean;
			} | null;
		}
	}
}

export {};
