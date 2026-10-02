# Task Board (Phase 3)

Status: all build tasks are done, including the i18n stretch goal (B4). Still open, and only the
owner can do them: P0 (create the public GitHub repo), P2 (Vercel deploy) and recording the demo video.
The desktop sidebar collapse from the architecture plan was not built.
Each task ends with lint, typecheck and tests green, plus one commit.

Legend: P0 = must ship, P1 = should ship, P2 = bonus.

## 1. Project Setup (P0) ~1.5h

| ID  | Objective                                                            | Files affected                                                                      | Depends on | Effort |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------- | ------ |
| S1  | Scaffold Next.js 16 + TS + Tailwind v4 + ESLint, src dir, `@/` alias | `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/*`                      | none       | 15m    |
| S2  | Strict TS options, Prettier, import sorting                          | `tsconfig.json`, `.prettierrc`, `eslint.config.mjs`                                 | S1         | 15m    |
| S3  | Env validation with zod, `.env.example`                              | `src/lib/env.ts`, `.env.example`                                                    | S1         | 15m    |
| S4  | Shared types                                                         | `src/types/content.ts`                                                              | S1         | 15m    |
| S5  | Jest + RTL + MSW wiring, one smoke test                              | `jest.config.ts`, `jest.setup.ts`, `tests/msw/*`, `tests/utils/renderWithStore.tsx` | S1         | 30m    |

## 2. Layout (P0) ~2.5h

| ID  | Objective                                             | Files affected                                                     | Depends on | Effort |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------ | ---------- | ------ |
| L1  | Design tokens, light and dark CSS variables           | `src/app/globals.css`                                              | S1         | 20m    |
| L2  | UI primitives                                         | `src/components/ui/*`                                              | L1         | 40m    |
| L3  | AppShell with Sidebar, Header, skip link, landmarks   | `src/components/layout/*`, `src/app/layout.tsx`                    | L2         | 45m    |
| L4  | Mobile drawer nav with focus trap and Escape to close | `src/components/layout/MobileNav.tsx`                              | L3         | 30m    |
| L5  | Route stubs, loading, error and not-found pages       | `src/app/**/page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` | L3         | 15m    |

## 3. Redux (P0) ~2h

| ID  | Objective                                                             | Files affected                                        | Depends on | Effort |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------- | ---------- | ------ |
| R1  | `makeStore`, typed hooks, `StoreProvider`                             | `src/store/index.ts`, `hooks.ts`, `StoreProvider.tsx` | S1         | 30m    |
| R2  | preferences, favorites, feed slices with tests                        | `src/features/*/…Slice.ts` + tests                    | R1, S4     | 45m    |
| R3  | localStorage persistence via listener middleware, hydrate after mount | `src/store/persistence.ts` + test                     | R2         | 30m    |
| R4  | Memoized selectors, including order merge                             | `src/features/feed/selectors.ts` + test               | R2         | 15m    |

## 4. API Integration (P0) ~4h

| ID  | Objective                                                                       | Files affected                                                       | Depends on | Effort |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- | ------ |
| A1  | Mock fixtures for news, movies, social                                          | `src/services/mocks/*.json`                                          | S4         | 30m    |
| A2  | Adapters normalizing provider data to `ContentItem`                             | `src/services/adapters/*` + tests                                    | S4         | 45m    |
| A3  | Route handlers with caching and mock fallback                                   | `src/app/api/{news,movies,social}/route.ts`                          | A1, A2, S3 | 60m    |
| A4  | RTK Query `contentApi` with infinite pagination                                 | `src/services/contentApi.ts`                                         | R1, A3     | 45m    |
| A5  | ContentCard, ContentGrid, skeletons, error with retry, "Demo data" badge        | `src/components/content/*`                                           | L2, A4     | 45m    |
| A6  | Settings panel: categories, sources, followed hashtags                          | `src/app/settings/page.tsx`, `src/features/preferences/components/*` | R2         | 30m    |
| A7  | Unified feed: round-robin interleave selector, source filter chips              | `src/app/page.tsx`, `src/features/feed/*` + selector test            | A5, A6, R4 | 45m    |
| A8  | Infinite scroll with spinner and "Load more" button fallback (required by spec) | `src/hooks/useInfiniteScroll.ts`, feed components                    | A7         | 45m    |
| A9  | Recommendations from history: genres of favorited movies boost TMDB discover    | `src/app/api/movies/route.ts`, `contentApi.ts`                       | A3, F1     | 20m    |

## 5. Search (P0) ~1.5h

| ID  | Objective                                              | Files affected                                     | Depends on | Effort |
| --- | ------------------------------------------------------ | -------------------------------------------------- | ---------- | ------ |
| Q1  | `useDebounce` hook with fake-timer tests               | `src/hooks/useDebounce.ts` + test                  | S5         | 15m    |
| Q2  | SearchBar syncing to `?q=`, keyboard shortcut `/`      | `src/features/search/components/SearchBar.tsx`     | Q1, L3     | 30m    |
| Q3  | Search page across all sources, empty and error states | `src/app/search/page.tsx`, `src/features/search/*` | Q2, A4     | 45m    |

## 6. Favorites (P0) ~1h

| ID  | Objective                                                | Files affected                                         | Depends on | Effort |
| --- | -------------------------------------------------------- | ------------------------------------------------------ | ---------- | ------ |
| F1  | FavoriteButton with `aria-pressed` and optimistic toggle | `src/features/favorites/components/FavoriteButton.tsx` | R2, A5     | 20m    |
| F2  | Favorites page with empty state                          | `src/app/favorites/page.tsx`                           | F1         | 30m    |
| F3  | Favorite count badge in sidebar                          | `Sidebar.tsx`                                          | F1         | 10m    |

## 7. Drag and Drop (P0) ~2h

| ID  | Objective                                                                                             | Files affected                                                | Depends on | Effort |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------- | ------ |
| D1  | SortableGrid with pointer, touch and keyboard sensors                                                 | `src/components/content/SortableGrid.tsx`                     | A5, R4     | 60m    |
| D2  | Persist order, screen-reader announcements                                                            | `feedSlice.ts`, `SortableGrid.tsx`                            | D1, R3     | 30m    |
| D3  | Motion layout animations, section transitions via `template.tsx`, card hover, reduced-motion fallback | `ContentCard.tsx`, `SortableGrid.tsx`, `src/app/template.tsx` | D1         | 45m    |

## 8. Dark Mode (P0) ~0.5h

| ID  | Objective                                         | Files affected                                               | Depends on | Effort |
| --- | ------------------------------------------------- | ------------------------------------------------------------ | ---------- | ------ |
| T1  | next-themes provider, system default, ThemeToggle | `src/app/providers.tsx`, `src/components/ui/ThemeToggle.tsx` | L1         | 30m    |

## 9. Trending (P0) ~1h

| ID  | Objective                                                       | Files affected                                                          | Depends on | Effort |
| --- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------- | ------ |
| TR1 | Trending endpoints and page sorted by popularity, category tabs | `contentApi.ts`, `src/app/trending/page.tsx`, `src/features/trending/*` | A4, A5     | 60m    |

## 10. Bonus (P1, cheap wins for the "creativity" score) ~2.5h

| ID  | Objective                                                                    | Files affected                                 | Depends on | Effort |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------- | ---------- | ------ |
| B1  | Mock sign-in, UserMenu with account info in header (header part is required) | `src/features/auth/*`, `Header.tsx`            | R1         | 45m    |
| B2  | Profile page: edit name, avatar, bio                                         | `src/app/profile/page.tsx`                     | B1         | 30m    |
| B3  | Real-time feed: SSE route + RTK Query streaming update + Live badge          | `src/app/api/stream/route.ts`, `contentApi.ts` | A7         | 60m    |
| B4  | i18n with react-i18next, English + Hindi (P2, only if time remains)          | `src/lib/i18n.ts`, locale JSON, all components | all        | 2-3h   |

## 11. Testing (P0) ~3h

| ID  | Objective                                                                                                      | Files affected                        | Depends on | Effort           |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------- | ---------------- |
| X1  | Unit and component tests, written alongside each task above                                                    | `**/*.test.ts(x)`                     | each task  | (included above) |
| X2  | Integration suites: feed, search, favorites, error and retry                                                   | `src/features/**/__tests__/*`         | all P0     | 90m              |
| X3  | Playwright: search, drag-and-drop reorder, sign in, favorites persist, dark mode; desktop and mobile viewports | `playwright.config.ts`, `tests/e2e/*` | all P0     | 90m              |

## 12. Deployment and Docs (P0) ~1.5h

| ID  | Objective                                                                      | Files affected             | Depends on | Effort          |
| --- | ------------------------------------------------------------------------------ | -------------------------- | ---------- | --------------- |
| P0  | Public GitHub repo, one commit per task for a clear history (spec asks for it) | GitHub                     | S1         | 10m             |
| P1  | GitHub Actions: lint, typecheck, Jest, Playwright                              | `.github/workflows/ci.yml` | X3         | 30m             |
| P2  | Vercel deploy with env vars (live link is required)                            | Vercel dashboard           | P1         | 20m             |
| P3  | README with setup and user flow, env guide, interview notes                    | `README.md`, `docs/*`      | all        | 40m             |
| P4  | Demo video script; you record it                                               | `docs/DEMO_SCRIPT.md`      | P2         | 20m + recording |

## Totals

| Scope                               | Hours      |
| ----------------------------------- | ---------- |
| P0 must-ship                        | about 22h  |
| P1 bonus (auth, profile, live feed) | about 2.5h |
| P2 stretch (i18n)                   | 2-3h       |

The 48-hour window fits P0 and P1 with room for review and recording.
Deploy to Vercel early, right after the first feed works, so the live link never becomes a last-minute risk.

## Proposed implementation order

S1-S5 + P0 -> L1-L5 + T1 -> R1-R4 -> A1-A7 -> F1-F3 -> A8-A9 -> Q1-Q3 -> TR1 -> early deploy (P2) -> D1-D3 -> B1-B3 -> X2-X3 -> P1, P3, P4 -> B4 if time remains

Dark mode moves early because every later component must be built and checked in both themes.
