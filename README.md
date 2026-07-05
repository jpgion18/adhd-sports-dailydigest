# ADHD Sports Daily Digest

A low-clutter web dashboard showing today's NFL, NBA, MLB, and NHL games at a glance.

## Design goals

- One page, no navigation, no login.
- Live games are surfaced first within each league; final and upcoming games follow.
- Star a team to pin its games to a "Your Teams" section at the top of the page, so the games you care about don't get lost in the full list. Favorites are stored in the browser (`localStorage`), not on a server.
- No autoplay, animation, or auto-refresh — the page only updates when reloaded.

## Data source

Game data comes from ESPN's public scoreboard endpoints (no API key required):

```
https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard
```

Each league is fetched independently and cached for 60 seconds (`src/lib/sports.ts`). If one league's request fails, the rest of the page still renders — the failing section shows a short "couldn't load" message instead of taking down the page.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Note: fetching from `site.api.espn.com` requires outbound network access; sandboxed environments that block that host will show "couldn't load" for every league.

## Project structure

- `src/lib/sports.ts` — fetches and normalizes ESPN scoreboard data for each league.
- `src/components/Digest.tsx` — client component rendering the digest, favorites, and pinned "Your Teams" section.
- `src/app/page.tsx` — server component that fetches all leagues and renders the digest.
