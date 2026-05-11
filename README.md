# D-Genesis Info

A fan-maintained reference database for *D-Genesis: Three Years after the Dungeons Appeared*.
Tracks explorer rankings (WDARL), combat stats, skill orbs, dungeons, creatures, and the series timeline.

## Stack

- **[SvelteKit](https://kit.svelte.dev/)** — framework, deployed via `@sveltejs/adapter-cloudflare`
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — hosting
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** — SQLite database
- **GitHub OAuth** — contributor authentication

## Features

- **Explorers** — searchable list with WDARL rankings, monikers, tags, nationality. Detail pages include rank history, stat readings (STR/VIT/INT/AGI/DEX/LUC + derived HP/MP/SP), and skill orb acquisitions, each with source citations.
- **Characters** — non-explorer named characters with notes, monikers, and tags.
- **Skill orbs** — known effects and per-creature / per-dungeon / per-floor drop rates with probability and Making cooldown.
- **Bestiary** — creatures by category (Humanoid, Beast, Undead, Demon, Aberration, Aquatic, Elemental, Ooze, Unknown), with the dungeons they appear in and the orbs they drop.
- **Dungeons** — area number, country, region, known floors, creatures found there, orbs found there.
- **Timeline** — events grouped by volume / pre-history, with citations and a side-anchored layout.
- **Filtering** — list pages support text search; explorers/characters also support tag chips that filter the list and round-trip via shareable URL params (`?q=`, `?tag=`).
- **Contributions** — every entity (and its sub-records: rankings, stats, orb acquisitions, monster-in-dungeon presence, timeline events, etc.) can be added, edited, or proposed for deletion via an inline Contribute form. Submissions land in a pending queue and are reviewed by an admin before being applied to the live data.
- **Citations everywhere** — Light Novel vs. Manga source, volume / chapter / J-Novel Club part, distinguishable in the admin diff so reviewers know exactly what is being changed.

## Repository layout

```
database/d1/          D1 schema + data snapshot
  schema.sql          Canonical schema (run on a fresh DB)
  snapshot.sql        Data-only dump of the live D1, refreshed via `npm run dump`
  seed-admin.sql      Template for granting yourself admin after first login
  SchemaHistory.md    Log of schema changes over time
web/                  SvelteKit application
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

D1 / Pages CLI commands need `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`
in the shell environment — wrangler does not read `.dev.vars` for CLI
invocations. Prefix with `npx dotenv -e .dev.vars --` to inject them from
`web/.dev.vars`.

**Bootstrapping a fresh DB** (e.g. forked the repo, want your own copy):

```bash
cd web
npx dotenv -e .dev.vars -- wrangler d1 create dgenesisinfo
# put the returned database_id into web/wrangler.jsonc
npx dotenv -e .dev.vars -- wrangler d1 execute dgenesisinfo --remote --file=../database/d1/schema.sql
npx dotenv -e .dev.vars -- wrangler d1 execute dgenesisinfo --remote --file=../database/d1/snapshot.sql
```

After your first login, edit `database/d1/seed-admin.sql` with your GitHub ID
and run it to grant yourself admin:

```bash
npx dotenv -e .dev.vars -- wrangler d1 execute dgenesisinfo --remote --file=../database/d1/seed-admin.sql
```

**Refreshing the snapshot** (run periodically so anyone cloning the repo
gets current data):

```bash
cd web
npm run dump
git add ../database/d1/snapshot.sql
git commit -m "data: refresh snapshot"
```

See [database/d1/SchemaHistory.md](database/d1/SchemaHistory.md) for the
record of schema changes over time.

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
