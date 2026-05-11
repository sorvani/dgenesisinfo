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
cp .dev.vars.example .dev.vars   # fill in credentials
npm install
npm run preview                   # wrangler pages dev with D1 bindings
```

## Database setup

```bash
cd web
npx wrangler d1 create dgenesisinfo
npx wrangler d1 execute dgenesisinfo --remote --file=../database/d1/schema.sql
node ../database/ingest/generate-sql.mjs
npx wrangler d1 execute dgenesisinfo --remote --file=../database/ingest/ingest.sql
```

## Deploying changes

This project deploys manually via Wrangler (not connected to git auto-deploy).

```bash
cd web
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name dgenesisinfo --branch main
```

## Contributing

Contributions are submitted via the site's Contribute form (login required).
All submissions are reviewed by an admin before being applied.
