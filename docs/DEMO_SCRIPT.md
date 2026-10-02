# Demo video script

About 4 minutes. Record the deployed site in a desktop browser window around 1400 × 900, with
browser zoom at 100%. Clear site data first so the app starts fresh.

Before recording, open these in tabs: the live site, the GitHub repository, and the latest
GitHub Actions run.

## 1. Introduction (20 seconds)

**Show:** the feed on first load.

**Say:** "This is Dispatch, a personalized content dashboard built with Next.js, React, TypeScript
and Redux Toolkit. It brings news, movie recommendations and social posts into one feed."

## 2. Personalized feed (40 seconds)

1. Point at the three badges on the first cards: News, Movie, Post. "The three sources are fetched
   in parallel and merged round-robin, so no source dominates."
2. Click the **Movies** filter chip, then **Everything** again.
3. Scroll down until more cards load. "Infinite scroll. There is also a Load more button for
   keyboard users."
4. Point at the **Just in** strip as a live post arrives. "New posts stream in over Server-Sent
   Events."

## 3. Settings change the feed (35 seconds)

1. Open **Settings**. Turn on **Science**, turn off **Sports**.
2. Follow the hashtag `cricket`.
3. Go back to **My feed**. "The feed refetches only what changed, and preferences are saved."

## 4. Drag and drop (35 seconds)

1. Drag the first card by its grip to the third position.
2. Reload the page. "The order is saved."
3. Tab to a grip, press Space, press the right arrow, press Space. "It also works with the keyboard,
   and screen readers hear every step."

## 5. Favorites and recommendations (30 seconds)

1. Press the heart on two cards, including one movie. Point at the count in the sidebar.
2. Open **Favorites**. "Favorites keep a snapshot, so they survive after a story leaves the feed."
3. "Movie recommendations are boosted by the genres of movies you favorite."

## 6. Search and trending (35 seconds)

1. Press `/` and type `space`. "Search is debounced, runs across all sources, and the query lives
   in the URL, so it can be shared."
2. Click the **Posts** chip. Then search `#cricket` to show hashtag search.
3. Open **Trending**. Use the left and right arrow keys across the category tabs.

## 7. Dark mode, account and language (30 seconds)

1. Toggle dark mode, then reload. "No flash of the wrong theme."
2. Click **Sign in**, enter a name and email. Open the account menu, then the profile, change the
   avatar colour and save.
3. In **Settings**, switch the language to हिन्दी, show the feed, then switch back.

## 8. Under the hood (20 seconds)

**Show:** the GitHub Actions run, then the README.

**Say:** "API keys stay on the server, and everything falls back to sample data if a provider fails.
There are over a hundred unit and integration tests, Playwright browser tests, and automated
accessibility checks in both themes. All of them run in CI on every push."
