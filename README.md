# Dispatch: a personalized content dashboard

Dispatch is a personal newspaper for the web. It merges news headlines, movie recommendations
and social posts into one feed shaped by the topics you choose. You can reorder the feed by
dragging, save favorites, search everything at once, and watch new posts arrive live.

Built with Next.js 16, React 19, TypeScript, Redux Toolkit with RTK Query, and Tailwind CSS v4.

- **Live demo:** https://content-dashboard-three-omega.vercel.app
- **Demo video:** _add the link here after recording_ (script in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md))

## Features

| Area              | What you get                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Personalized feed | News, movies and posts from your chosen categories, merged round-robin into one feed. Filter by source.                      |
| Recommendations   | Movie picks follow your categories and are boosted by the genres of movies you favorite.                                     |
| Social posts      | A mock social network you can filter by category, `#hashtag` or `@handle`. Followed hashtags join your feed.                 |
| Real-time         | New posts stream in over Server-Sent Events and appear in a "Just in" strip, with a live status badge.                       |
| Infinite scroll   | More stories load as you scroll. A "Load more" button does the same for keyboard users.                                      |
| Drag and drop     | Reorder feed cards and favorites with a mouse, touch or the keyboard. Screen readers announce each step. The order is saved. |
| Search            | Search-as-you-type across all sources, debounced, with the query kept in the URL. Press `/` to jump to search.               |
| Trending          | The most popular items per category, laid out like a newspaper's ranked lists.                                               |
| Favorites         | Save anything with the heart. Favorites keep a snapshot, so they survive after a story leaves the feed.                      |
| Settings          | Choose categories, sources, followed hashtags and the interface language.                                                    |
| Account           | Mock sign-in with a profile you can edit: name, bio and avatar colour.                                                       |
| Dark mode         | Follows your system by default, remembers your choice, and never flashes the wrong theme.                                    |
| Languages         | English and Hindi interface.                                                                                                 |

Without API keys, the app uses built-in sample stories and labels them "Demo data", so it always works.

## Getting started

You need Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional: add API keys
npm run dev
```

Open http://localhost:3000.

### API keys (optional)

| Variable             | Where to get it                                        | Without it                |
| -------------------- | ------------------------------------------------------ | ------------------------- |
| `NEWS_API_KEY`       | https://newsapi.org/register (free developer plan)     | Sample headlines          |
| `TMDB_API_KEY`       | https://www.themoviedb.org/settings/api (v3 "API Key") | Sample movies             |
| `USE_MOCK_DATA`      | Set to `true` to force sample data everywhere          | Live data when keys exist |
| `STREAM_INTERVAL_MS` | Milliseconds between live posts, default `20000`       | 20 seconds                |

Keys are read only on the server. Nothing uses the `NEXT_PUBLIC_` prefix, so no key can reach the browser.

> **NewsAPI note:** the free developer plan only accepts requests from `localhost`. On a deployed site
> NewsAPI refuses the request, and the app falls back to sample news on its own. TMDB works everywhere.

### Scripts

| Command                       | What it does                                         |
| ----------------------------- | ---------------------------------------------------- |
| `npm run dev`                 | Development server                                   |
| `npm run build` / `npm start` | Production build and server                          |
| `npm run lint`                | ESLint, including import order                       |
| `npm run typecheck`           | Generates route types, then runs `tsc`               |
| `npm test`                    | Unit and integration tests (Jest)                    |
| `npm run test:coverage`       | The same, with a coverage report                     |
| `npm run test:e2e`            | Builds the app and runs the Playwright browser tests |
| `npm run validate`            | Lint, typecheck and unit tests together              |

The first browser test run needs a browser download: `npx playwright install chromium`.

## How it works

```
Browser                                   Next.js server (route handlers)
───────                                   ───────────────────────────────
React components                          /api/news      ─▶ NewsAPI  ─┐
  │ read state                            /api/movies    ─▶ TMDB     ─┼─▶ normalized ContentItem[]
  ▼                                       /api/social    ─▶ mock      │   (sample data on any failure)
Redux store ─── RTK Query ── fetch ──────▶ /api/trending               │
  ├ preferences ─┐                        /api/search  ───────────────┘
  ├ favorites    ├─▶ localStorage         /api/stream  ─▶ Server-Sent Events (live posts)
  ├ feed order   │   (validated on load)
  └ auth ────────┘
```

- **Route handlers are a small backend.** They hide API keys, validate every query parameter with
  zod, and turn each provider's response into one `ContentItem` type. Provider responses are
  validated too, and any failure (bad key, rate limit, timeout, odd data) falls back to sample data.
  Responses are cached for five minutes to protect the NewsAPI limit of 100 requests a day.
- **RTK Query owns server data.** Each source is an infinite query that pages on its own. Fetched
  content stays in the RTK Query cache and is never copied into slices.
- **Slices own user data.** Preferences, favorites, feed order and the profile are saved to
  localStorage by a debounced listener middleware. Saved data is validated with zod on load, so a
  corrupted or edited entry cannot break the app.
- **The unified feed** fetches the three sources in parallel. It merges them round-robin page by
  page, so earlier cards never move when a new page arrives. Then it applies your saved drag order.
- **Live posts** use Server-Sent Events. RTK Query opens the stream when the feed mounts, pushes
  posts into its cache, and closes the stream when you leave.

The full design, with the reasoning behind each choice, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Project structure

```
src/
├─ app/            Routes only: pages, layouts, loading and error screens, API route handlers
├─ features/       One folder per feature: feed, favorites, preferences, search, trending, auth
├─ components/     Shared UI: layout shell, content cards and grids, small UI primitives
├─ services/       RTK Query API definition
├─ store/          Store setup, typed hooks, persistence, hydration helpers
├─ server/         Server-only code: env validation, providers, sources, sample data
├─ i18n/           Translations (English and Hindi) and helpers
├─ hooks/, lib/    Small shared hooks and utilities
└─ types/          The shared ContentItem type
tests/
├─ e2e/            Playwright browser and accessibility tests
├─ msw/            Network mocks for Jest
└─ utils/, fixtures/, mocks/
```

## Design decisions

- **Drag and drop uses dnd-kit, not React DnD or Framer Motion `Reorder`.** The brief suggests those
  two. React DnD has no keyboard support and its HTML5 backend ignores touch. `Reorder` handles one
  axis only, not a responsive grid, and it is not keyboard accessible either. dnd-kit supports
  mouse, touch and keyboard, and it announces each step to screen readers. Motion (Framer Motion)
  still drives the page transitions and live-post animations.
- **Theme lives in next-themes, not Redux.** The theme must be applied by a script before React
  loads, or dark-mode users see a white flash. Redux cannot run that early.
- **Saved state loads after the first render.** The server cannot read localStorage, so the first
  client render matches the server. A small hook then switches components to saved data. Pages
  that depend on saved data show a skeleton until then, which avoids hydration mismatches.
- **Mock authentication.** The brief allows it. A real provider would add a database and secrets
  for no visible benefit here. Sign-in stores a profile in the browser only.
- **TMDB instead of Spotify** for recommendations. Spotify needs OAuth for every user.
- **Images load directly from their source.** News images come from thousands of publisher
  domains. Running them through Next's image optimizer would turn it into an open proxy and use up
  the hosting quota.

## Quality

- **Tests:** 107 unit and integration tests cover reducers, persistence, selectors, provider
  adapters fed bad data, every API route, and each feature through a real store. They include the
  empty, error and retry states. Line coverage is about 93%.
- **Browser tests:** Playwright covers search, drag and drop by mouse and keyboard, sign-in and
  profile editing, favorites surviving a reload, dark mode, and the mobile menu.
- **Accessibility:** axe checks every page against WCAG 2.1 AA in light and dark mode on every
  test run. The app has a skip link, landmarks, visible focus rings, a focus-trapping mobile menu,
  keyboard drag and drop, and announced live updates. It also honours reduced motion, and every
  colour pair was checked for AA contrast.
- **Security:** API keys stay on the server. Query parameters, provider responses and saved state
  are all validated. External links open with `noopener noreferrer`, only `https` links are
  rendered, and basic security headers are set.
- **CI:** GitHub Actions runs lint, typecheck, formatting, unit tests with coverage, and the
  browser tests on every push.

## Deployment

1. Push the repository to GitHub.
2. Import it on [Vercel](https://vercel.com/new). It detects Next.js, so no settings are needed.
3. Add `TMDB_API_KEY` (and `NEWS_API_KEY` if you like) under Project, then Settings, then
   Environment Variables.
4. Deploy. Use the production address under Settings, then Domains: one-off deployment links
   ask visitors to log in to Vercel.

## Known limitations

- Social posts are sample data by design, because real social APIs are closed or paid.
- News and movie text stays in the language it was published in. Only the interface is translated.
- On the free NewsAPI plan, a deployed site shows sample news (see the NewsAPI note above).
- Each serverless live stream closes after about a minute, and the browser reconnects on its own.
