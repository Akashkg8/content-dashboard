import { hydrated } from '@/store/actions';

import {
  addHashtag,
  initialPreferences,
  MAX_HASHTAGS,
  normalizeHashtag,
  preferencesReducer,
  removeHashtag,
  resetPreferences,
  toggleCategory,
  toggleSource,
} from './preferencesSlice';

const reduce = (...actions: Parameters<typeof preferencesReducer>[1][]) =>
  actions.reduce(preferencesReducer, initialPreferences);

describe('preferencesSlice', () => {
  it('toggles categories and keeps them in canonical order', () => {
    const state = reduce(toggleCategory('science'), toggleCategory('health'));
    expect(state.categories).toEqual([
      'technology',
      'business',
      'sports',
      'entertainment',
      'health',
      'science',
    ]);
    expect(reduce(toggleCategory('sports')).categories).not.toContain('sports');
  });

  it('never removes the last category or source', () => {
    const one = {
      ...initialPreferences,
      categories: ['science' as const],
      sources: ['news' as const],
    };
    expect(preferencesReducer(one, toggleCategory('science')).categories).toEqual(['science']);
    expect(preferencesReducer(one, toggleSource('news')).sources).toEqual(['news']);
  });

  it('normalizes, de-duplicates and caps hashtags', () => {
    expect(reduce(addHashtag('  #ReactJS ')).hashtags).toContain('reactjs');
    expect(reduce(addHashtag('#webdev')).hashtags.filter((t) => t === 'webdev')).toHaveLength(1);
    expect(reduce(addHashtag('not valid!')).hashtags).toEqual(initialPreferences.hashtags);

    const many = Array.from({ length: 20 }, (_, i) => addHashtag(`tag${i}`));
    expect(reduce(...many).hashtags).toHaveLength(MAX_HASHTAGS);
    expect(reduce(removeHashtag('space')).hashtags).toEqual(['webdev']);
  });

  it('resets and hydrates', () => {
    expect(reduce(toggleCategory('science'), resetPreferences())).toEqual(initialPreferences);
    const saved = {
      categories: ['health' as const],
      sources: ['movie' as const],
      hashtags: [],
      language: 'hi' as const,
    };
    expect(reduce(hydrated({ preferences: saved }))).toEqual(saved);
    expect(reduce(hydrated({}))).toEqual(initialPreferences);
  });

  it.each([
    ['#Space', 'space'],
    ['web_dev', 'web_dev'],
    ['', null],
    ['two words', null],
    ['x'.repeat(31), null],
  ])('normalizeHashtag(%j) is %j', (input, expected) => {
    expect(normalizeHashtag(input)).toBe(expected);
  });
});
