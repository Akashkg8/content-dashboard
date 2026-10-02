# Personalized Content Dashboard: Architecture (Phase 2)

Status: implemented. Section 12 lists where the build differs from this plan.

## 0. Assignment requirements traceability

Source: "SDE Intern - Frontend Development Assignment" (48 hours, public GitHub repo,
README, demo video, live link).

| Spec | Requirement                                                                 | Covered by                                                                    |
| ---- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | Preferences in a settings panel, persisted                                  | Settings page + preferences slice + localStorage                              |
| 1    | News by preferred categories                                                | `/api/news` -> NewsAPI                                                        |
| 1    | Recommendations from history or preferences                                 | `/api/movies` -> TMDB discover, genres from preferences plus favorited movies |
| 1    | Social posts by hashtag or profile (mock ok)                                | `/api/social?hashtag=&user=` mock API                                         |
| 1    | Cards: image, headline, description, CTA ("Read More", "Play Now")          | `ContentCard`                                                                 |
| 1    | Infinite scroll or pagination                                               | RTK Query infinite query + IntersectionObserver, "Load more" button fallback  |
| 2    | Responsive layout: sidebar, header with search, user settings, account info | `AppShell`, `Header` with `UserMenu`                                          |
| 2    | **One unified feed** of news, recommendations, social                       | Interleaved feed, filter chips by source                                      |
| 2    | Trending by category                                                        | `/trending` with category tabs                                                |
| 2    | Favorites section                                                           | `/favorites`                                                                  |
| 3    | Search across categories, debounced                                         | `/search?q=` + `useDebounce`                                                  |
| 4    | Drag-and-drop reorder of feed cards                                         | dnd-kit sortable (see flag 1)                                                 |
| 4    | Dark mode via CSS custom properties + Tailwind                              | Tokens in `globals.css`, next-themes                                          |
| 4    | Section transitions, loading spinners, card hover                           | `motion` page transitions, Spinner, hover lift                                |
| 5    | Redux Toolkit for preferences and content data                              | Slices + RTK Query cache                                                      |
| 5    | Thunks or RTK Query                                                         | RTK Query                                                                     |
| 5    | Persist preferences and dark mode                                           | listener middleware; next-themes writes theme to localStorage                 |
| 6    | Unit, integration (empty, error states), E2E (search, drag and drop, auth)  | Jest + RTL + MSW, Playwright                                                  |
| 7    | Bonus: auth with profile customization                                      | Mock auth + profile page                                                      |
| 7    | Bonus: real-time feed via SSE                                               | `/api/stream` + RTK Query `onCacheEntryAdded`                                 |
| 7    | Bonus: i18n with react-i18next                                              | Stretch only (see flag 6)                                                     |
| Eval | Security of API keys                                                        | Keys server-only in route handlers                                            |
| Eval | WCAG accessibility                                                          | Keyboard drag and drop, focus management, AA contrast                         |

## 1. Stack

| Concern          | Choice                                         | Why / tradeoff                                                                                                |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 App Router, React 19                | Current standard. Route handlers give us a free BFF (backend-for-frontend).                                   |
| Language         | TypeScript strict + `noUncheckedIndexedAccess` | Catches undefined array/record access.                                                                        |
| Styling          | Tailwind CSS v4                                | CSS-first config, no tailwind.config.js.                                                                      |
| State            | Redux Toolkit 2                                | Required by assignment.                                                                                       |
| Server data      | RTK Query                                      | Caching, dedupe, loading/error states, infinite queries built in. Thunks would mean hand-writing all of that. |
| Persistence      | Listener middleware -> localStorage            | ~20 lines. redux-persist is overkill and fights SSR hydration.                                                |
| Theme            | next-themes                                    | Prevents the dark-mode flash on load. Theme is NOT in Redux (see 4.3).                                        |
| Drag & drop      | dnd-kit (core + sortable)                      | Keyboard + screen-reader support. react-beautiful-dnd is deprecated.                                          |
| Animation        | motion (Framer Motion)                         | Layout animations pair well with reordering. Respects reduced motion.                                         |
| Unit/integration | Jest 30 + React Testing Library + MSW          | Spec names Jest. MSW mocks the network, not our code.                                                         |
| E2E              | Playwright                                     | Faster and more reliable than Cypress, multi-browser.                                                         |
| Package manager  | npm                                            | Already installed on this machine.                                                                            |
| Hosting          | Vercel + GitHub Actions CI                     | Zero-config Next.js. CI runs lint, typecheck, tests.                                                          |

## 2. Folder structure (feature-based)

```
content-dashboard/
├─ src/
│  ├─ app/                          # Routing only. Thin pages.
│  │  ├─ layout.tsx                 # <html>, providers, AppShell
│  │  ├─ page.tsx                   # Personalized feed
│  │  ├─ trending/page.tsx
│  │  ├─ favorites/page.tsx
│  │  ├─ search/page.tsx            # reads ?q=
│  │  ├─ settings/page.tsx          # category preferences
│  │  ├─ loading.tsx  error.tsx  not-found.tsx
│  │  └─ api/                       # BFF: hides keys, normalizes data
│  │     ├─ news/route.ts
│  │     ├─ movies/route.ts
│  │     └─ social/route.ts
│  ├─ features/
│  │  ├─ feed/          components/, hooks/, feedSlice.ts        # card order
│  │  ├─ preferences/   components/, preferencesSlice.ts
│  │  ├─ favorites/     components/, favoritesSlice.ts
│  │  ├─ search/        components/SearchBar.tsx, hooks/
│  │  ├─ trending/      components/
│  │  └─ auth/          mock profile, authSlice.ts               # bonus
│  ├─ components/
│  │  ├─ layout/        AppShell, Sidebar, Header, MobileNav
│  │  ├─ content/       ContentCard, ContentGrid, SortableGrid, CardSkeleton
│  │  └─ ui/            Button, IconButton, Badge, EmptyState, ErrorState, ThemeToggle
│  ├─ store/
│  │  ├─ index.ts       makeStore(), RootState, AppDispatch
│  │  ├─ hooks.ts       useAppDispatch, useAppSelector
│  │  ├─ persistence.ts listener middleware + hydrate
│  │  └─ StoreProvider.tsx
│  ├─ services/
│  │  ├─ contentApi.ts  RTK Query createApi (one API, three endpoints)
│  │  ├─ adapters/      newsAdapter.ts, tmdbAdapter.ts, socialAdapter.ts
│  │  └─ mocks/         fixture JSON used as API fallback
│  ├─ lib/              env.ts (validated), utils.ts, constants.ts
│  ├─ hooks/            useDebounce.ts, useInfiniteScroll.ts
│  └─ types/            content.ts (ContentItem, Category, ...)
├─ tests/
│  ├─ msw/              handlers.ts, server.ts
│  ├─ utils/            renderWithStore.tsx
│  └─ e2e/              *.spec.ts (Playwright)
├─ docs/                ARCHITECTURE.md, TASKS.md
├─ .github/workflows/ci.yml
└─ .env.example
```

Rules:

- `app/` imports from `features/` and `components/`, never the reverse.
- Features never import from each other except through `store/` selectors.
- Unit tests sit next to the file they test (`Foo.test.tsx`).

## 3. Data model and API layer

### 3.1 One normalized type

```ts
type ContentSource = 'news' | 'movie' | 'social';
type Category = 'technology' | 'sports' | 'business' | 'entertainment' | 'health' | 'science';

interface ContentItem {
  id: string; // `${source}:${providerId}`, stable for favorites and ordering
  source: ContentSource;
  title: string;
  description: string;
  imageUrl: string | null;
  url: string; // CTA target
  ctaLabel: 'Read more' | 'Watch trailer' | 'View post';
  category: Category;
  publishedAt: string; // ISO
  popularity: number; // drives Trending sort
}
```

The UI only ever sees `ContentItem`. Swapping NewsAPI for GNews touches one adapter.

### 3.2 Request flow

```
Component -> RTK Query hook -> /api/news?category=&q=&page=   (Next route handler)
                                  ├─ key present  -> NewsAPI.org -> newsAdapter -> ContentItem[]
                                  └─ no key/error -> mocks/news.json -> ContentItem[]
```

- Route handlers keep keys server-side and avoid CORS. NewsAPI's free tier
  rejects browser calls from non-localhost origins, so this is required, not optional.
- Every response is `{ items: ContentItem[], page, hasMore, source: 'live' | 'mock' }`.
  The UI shows a small "Demo data" badge when `source === 'mock'`. Honest, and the demo never breaks.
- Provider `fetch` calls use `next: { revalidate: 300 }`, caching for 5 minutes.
  That protects the 100 requests/day NewsAPI limit.
- `lib/env.ts` validates env vars once with zod.

### 3.3 Providers

| Feed            | Provider    | Endpoints                                                                                      | Key            |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------- | -------------- |
| News            | NewsAPI.org | `/v2/top-headlines?category=`, `/v2/everything?q=`                                             | `NEWS_API_KEY` |
| Recommendations | TMDB        | `/discover/movie?with_genres=`, `/trending/movie/week`, `/search/movie`                        | `TMDB_API_KEY` |
| Social          | Mock        | Seeded JSON served by `/api/social?hashtag=&user=&page=`, filterable and paged like a real API | none           |

Recommendations use preference categories mapped to TMDB genre ids, boosted by
the genres of movies the user has favorited. That satisfies "based on user history".

### 3.4 Unified feed

The feed fetches the three sources in parallel. A memoized selector interleaves
them round-robin (news, movie, social, news...), so no source dominates.
Each source paginates independently; "next page" asks every source that still has `hasMore`.

### 3.5 Real-time (bonus)

`/api/stream` is a Server-Sent Events route that emits a new mock social post every
~20 seconds. The social endpoint's `onCacheEntryAdded` opens an `EventSource` and
prepends posts into the RTK Query cache. A "Live" badge shows the connection state.
SSE fits Vercel route handlers; WebSockets would need a separate server.

## 4. Redux structure

### 4.1 Store shape

```
RootState
├─ contentApi        RTK Query cache (server state; never duplicated into slices)
├─ preferences       { categories: Category[], sources: ContentSource[], hashtags: string[] }
├─ favorites         { ids: string[], items: Record<string, ContentItem> }
├─ feed              { order: string[] }      # user's drag-and-drop order of item ids
└─ auth (bonus)      { user: { name, email, avatar, bio } | null }   # persisted too
```

Favorites store a snapshot of the item, so the Favorites page works after the
API cache expires or the provider drops the article.

### 4.2 Persistence

- `listenerMiddleware` watches preferences, favorites and feed actions. It writes
  those three slices to localStorage, debounced.
- On mount, `StoreProvider` dispatches `hydrate()` once. Doing it after mount
  avoids server/client hydration mismatches.
- Storage access is wrapped in try/catch for Safari private mode and quota errors.

### 4.3 What is deliberately NOT in Redux

- **Theme:** next-themes must set the class before React hydrates, or the page
  flashes white. Redux cannot run that early. Interview point: pick the tool by
  when the state is needed.
- **Search query:** lives in the URL (`/search?q=`) so results are shareable,
  and back/forward work.
- **Fetched content:** stays in the RTK Query cache. Copying it into a slice is
  the most common RTK anti-pattern.

### 4.4 Store per request

`makeStore()` is called once per `StoreProvider` mount via `useRef`, as the Redux
docs recommend for the App Router. A module-level singleton would leak state
between users on the server.

## 5. Component hierarchy

```
RootLayout (server)
└─ Providers (client): ThemeProvider > StoreProvider
   └─ AppShell
      ├─ Sidebar           nav: Feed, Trending, Favorites, Settings; collapsible on desktop
      ├─ MobileNav         drawer below 768px
      ├─ Header            SearchBar, ThemeToggle, UserMenu (account info, settings link, sign out)
      └─ <main>{page}</main>   wrapped in template.tsx for motion section transitions
         ├─ FeedPage       -> SourceFilterChips + LiveBadge -> SortableGrid (one unified, interleaved feed) -> ContentCard
         ├─ TrendingPage   -> CategoryTabs -> ContentGrid (sorted by popularity) -> ContentCard
         ├─ ProfilePage    -> profile form (bonus auth)
         ├─ FavoritesPage  -> SortableGrid | EmptyState
         ├─ SearchPage     -> ContentGrid | EmptyState
         └─ SettingsPage   -> CategoryPicker
ContentCard: image (next/image), source badge, title, description, CTA link, FavoriteButton
```

Pages are server components that render one client feature component.
Interactive pieces such as cards, drag and drop and search are client components.
That keeps the client bundle limited to what actually needs interactivity.

## 6. State flow examples

**Favorite toggle:** click heart -> `toggleFavorite(item)` -> favoritesSlice ->
listener saves to localStorage -> every card's `selectIsFavorite(id)` re-renders.

**Drag reorder:** dnd-kit `onDragEnd(active, over)` -> `reorder({ from, to })` ->
`feed.order` updated -> `selectOrderedItems` (memoized with createSelector)
merges API items with the saved order. New items not yet in `order` go to the end.

**Search:** typing -> local input state -> `useDebounce(400ms)` -> `router.replace('/search?q=')`
-> SearchPage reads `q` -> search endpoints on all three sources -> merged results.
RTK Query keys results by query, so stale responses never overwrite fresh ones.

**Preferences change:** toggle category -> preferencesSlice -> feed hooks get new
args -> RTK Query fetches only the combinations not already cached.

## 7. Routing plan

| Route                                     | Rendering                  | Content                                                   |
| ----------------------------------------- | -------------------------- | --------------------------------------------------------- |
| `/`                                       | Server shell + client feed | Personalized sections, drag and drop, infinite scroll     |
| `/trending`                               | Server shell + client grid | Top headlines + TMDB trending + top social, by popularity |
| `/favorites`                              | Client (localStorage)      | Saved items, drag and drop                                |
| `/search?q=`                              | Client                     | Cross-source results                                      |
| `/settings`                               | Client                     | Category and source preferences, hashtags to follow       |
| `/profile`                                | Client                     | Mock account: name, avatar, bio (bonus)                   |
| `/api/stream`                             | Route handler              | SSE live posts (bonus)                                    |
| `/api/news`, `/api/movies`, `/api/social` | Route handlers             | BFF                                                       |

Every route has `loading.tsx` skeletons and an `error.tsx` boundary with retry.

## 8. Reusable UI strategy

- Handwritten primitives in `components/ui`, Tailwind plus `cva` for variants.
  No shadcn: fewer files to explain, and every line is yours in an interview.
- Design tokens as CSS variables in `globals.css` under Tailwind v4 `@theme`,
  with a `.dark` override. Components use tokens, never raw hex values.
- `lucide-react` icons. Every icon-only button gets an `aria-label`.
- Mobile first: 1 column, 2 at `md`, 3 at `xl`. Sidebar becomes a drawer below `md`.
- Accessibility baseline: visible focus rings, landmarks, skip link,
  `prefers-reduced-motion` honored, keyboard drag and drop, WCAG AA contrast in both themes.

## 9. Testing strategy

| Layer       | Tool                   | What                        | Examples                                                                                                                                     |
| ----------- | ---------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Jest                   | Pure logic                  | reducers, order-merge selector, adapters fed bad provider data, useDebounce                                                                  |
| Component   | RTL                    | Behaviour, not markup       | ContentCard CTA and favorite, ThemeToggle, SearchBar debounce                                                                                |
| Integration | RTL + MSW + real store | Feature through the network | feed loads, error then retry, mock fallback badge, search empty state                                                                        |
| E2E         | Playwright             | Real user journeys          | search, drag-and-drop reorder (pointer and keyboard), sign in and profile, favorite persists after reload, dark mode persists, mobile drawer |

- MSW intercepts `/api/*`, so tests exercise RTK Query for real.
- `renderWithStore(ui, { preloadedState })` helper for every component test.
- Playwright runs against a production build with `USE_MOCK_DATA=true`, so E2E
  never depends on live API keys or rate limits.
- Target about 80% line coverage on `features/`, `store/`, `services/`.
  No coverage chasing on layout files.

## 10. Environment variables

| Name            | Required | Purpose                                        |
| --------------- | -------- | ---------------------------------------------- |
| `NEWS_API_KEY`  | No       | NewsAPI.org key. Missing means mock news.      |
| `TMDB_API_KEY`  | No       | TMDB v3 key. Missing means mock movies.        |
| `USE_MOCK_DATA` | No       | `true` forces mocks everywhere (tests, demos). |

No `NEXT_PUBLIC_` keys. Nothing secret reaches the browser.

## 11. Flags and risks

1. **Drag-and-drop library deviates from the spec.** The spec says "Use React DnD or
   Framer Motion". Neither fits well: React DnD has no keyboard support and its
   HTML5 backend ignores touch; Framer Motion's `Reorder` only handles single-axis
   lists, not a responsive grid, and also lacks keyboard support. dnd-kit does all three, and
   WCAG is an evaluation criterion. Framer Motion still handles the animations.
   The README will justify this. Fallback if you prefer the literal reading: Framer Motion `Reorder` with a single-column feed.
2. **TypeScript 7 just shipped** with the new native compiler. I'll pin TypeScript 5.9
   unless Next.js 16 and next/jest are confirmed to work with 7. Stability beats novelty for a graded submission.
3. **NewsAPI free tier** is licensed for development only and limited to 100 requests/day.
   Fine for an assignment with server-side caching and mock fallback. GNews is a drop-in alternative via the adapter.
4. **Spotify skipped** in favor of TMDB. Spotify needs OAuth, which adds work for no grading value.
5. **Mock auth instead of NextAuth.** The spec allows mock auth. NextAuth without a database adds setup and secrets for no visible gain.
6. **i18n is a stretch goal only.** react-i18next is awkward with server components, and it touches every string.
   Done last, only if time remains.
7. **Submission needs things only you can do:** a public GitHub repo, a Vercel account, and the demo video recording.
   I'll provide the demo script.

## 12. Changes made during implementation

| Plan                                  | What was built                                      | Why                                                                                      |
| ------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/lib/env.ts`                      | `src/server/env.ts`, guarded by `server-only`       | Importing it from client code now fails the build, so keys cannot leak.                  |
| Fixture JSON in `src/services/mocks/` | Typed seed data in `src/server/mock/`               | Type-checked, and timestamps are generated relative to now so sample stories look fresh. |
| `cva` for component variants          | Plain variant maps with `clsx` and `tailwind-merge` | Fewer dependencies for the handful of variants needed.                                   |
| Search on three endpoints             | One `/api/search` route that queries all sources    | One request per search, one cache entry.                                                 |
| Trending on existing endpoints        | A dedicated `/api/trending` route                   | Each source has its own notion of "popular".                                             |
| i18n as a stretch goal                | English and Hindi, typed keys                       | Built. Content text stays in its original language.                                      |
| Desktop sidebar collapse              | Not built                                           | Low value next to the other features.                                                    |

Two implementation details worth knowing:

- **Hydration.** Pages sit inside Suspense boundaries from `loading.tsx`, so they can hydrate after
  the store has already loaded localStorage. The `useStoreHydrated` and `useT` hooks return the
  server values during hydration and switch right after, which keeps server and client HTML equal.
- **Live strip.** The "Just in" strip has a fixed height from the first render, so arriving posts
  never shift the feed, even in the middle of a drag.
