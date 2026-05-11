# D-Genesis Info

A fan-maintained reference database for *D-Genesis: Three Years after the Dungeons Appeared*.
Tracks explorer rankings (WDARL), combat stats, skill orbs, dungeons, creatures, and the series timeline.

## Stack

- **[SvelteKit](https://kit.svelte.dev/)** — framework, deployed via `@sveltejs/adapter-cloudflare`
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — hosting
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** — SQLite database
- **GitHub OAuth** — contributor authentication

## Repository layout

```
data/               Source JSON files (characters, orbs, timeline)
database/
  d1/               D1 schema and migration SQL files
  ingest/           Script to generate SQL from JSON source data
web/                SvelteKit application
```

## Local development

```bash
cd web
cp .dev.vars.example .dev.vars
npm install
npm run preview                   # wrangler pages dev with D1 bindings
```

Fill in `web/.dev.vars` with:

| Variable                | Used for                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Targeting the right Cloudflare account for `wrangler` commands |
| `CLOUDFLARE_API_TOKEN`  | Authenticating those commands without `wrangler login`         |
| `GITHUB_CLIENT_ID`      | GitHub OAuth app — contributor login                           |
| `GITHUB_CLIENT_SECRET`  | GitHub OAuth app — contributor login                           |
| `SESSION_SECRET`        | Cookie signing (`openssl rand -hex 32`)                        |

`.dev.vars` is gitignored. Never commit it.

## Database setup

D1 / Pages CLI commands also need `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` in the shell environment — wrangler does not read
`.dev.vars` for CLI invocations. Prefix with `npx dotenv -e .dev.vars --` to
inject them from `web/.dev.vars`:

```bash
cd web
npx dotenv -e .dev.vars -- wrangler d1 create dgenesisinfo
npx dotenv -e .dev.vars -- wrangler d1 execute dgenesisinfo --remote --file=../database/d1/schema.sql
node ../database/ingest/generate-sql.mjs
npx dotenv -e .dev.vars -- wrangler d1 execute dgenesisinfo --remote --file=../database/ingest/ingest.sql
```

If you forked the repo for your own deployment, update `database_id` in
`web/wrangler.jsonc` to the ID returned by `wrangler d1 create`.

## Deploying changes

This project deploys manually via Wrangler (not connected to git auto-deploy).

```bash
cd web
npm run build
npm run deploy
```

`npm run deploy` wraps `wrangler pages deploy` with
`dotenv -e .dev.vars --` so `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
from `web/.dev.vars` are injected into the shell env before wrangler runs.
This pins the deploy to the correct Cloudflare account regardless of which
account `wrangler login` is currently authenticated as — important when
working across multiple Cloudflare accounts on the same machine.

## Contributing

Contributions are submitted via the site's Contribute form (login required).
All submissions are reviewed by an admin before being applied.
