import type { Category } from '@/types/content';

const KEYWORDS: Record<Category, readonly string[]> = {
  technology: [
    'ai',
    'tech',
    'software',
    'app',
    'apple',
    'google',
    'chip',
    'robot',
    'cyber',
    'startup',
    'data',
    'internet',
    'phone',
  ],
  business: [
    'market',
    'stock',
    'econom',
    'bank',
    'finance',
    'price',
    'trade',
    'earnings',
    'invest',
    'company',
    'inflation',
    'rate',
  ],
  sports: [
    'match',
    'cup',
    'league',
    'team',
    'player',
    'goal',
    'cricket',
    'football',
    'tennis',
    'olympic',
    'race',
    'coach',
    'championship',
  ],
  entertainment: [
    'film',
    'movie',
    'music',
    'album',
    'tv',
    'series',
    'star',
    'actor',
    'actress',
    'box office',
    'festival',
    'show',
    'song',
  ],
  health: [
    'health',
    'medical',
    'disease',
    'vaccine',
    'hospital',
    'doctor',
    'diet',
    'cancer',
    'virus',
    'mental',
    'sleep',
    'study finds',
  ],
  science: [
    'space',
    'nasa',
    'planet',
    'scientist',
    'research',
    'climate',
    'species',
    'physics',
    'telescope',
    'fossil',
    'ocean',
    'quantum',
  ],
};

/**
 * Best-effort category for items whose provider does not say (NewsAPI search
 * results). Counts keyword hits in the text and falls back when nothing matches.
 */
export function guessCategory(text: string, fallback: Category = 'technology'): Category {
  const haystack = ` ${text.toLowerCase()} `;
  let best = fallback;
  let bestScore = 0;
  for (const [category, words] of Object.entries(KEYWORDS) as [Category, readonly string[]][]) {
    const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return best;
}
