import { signIn } from '@/features/auth/authSlice';
import { toggleFavorite } from '@/features/favorites/favoritesSlice';
import { toggleCategory } from '@/features/preferences/preferencesSlice';

import { hydrated } from './actions';
import { makeStore } from './index';
import { loadState, SAVE_DELAY_MS, STORAGE_KEY } from './persistence';
import { makeContentItem } from '../../tests/fixtures/content';

const save = (value: unknown) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

describe('loadState', () => {
  it('returns nothing when storage is empty or corrupt', () => {
    expect(loadState()).toEqual({});
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState()).toEqual({});
  });

  it('keeps valid slices and drops invalid ones', () => {
    save({
      preferences: { categories: ['science'], sources: ['news'], hashtags: ['space'] },
      feed: { order: 'not an array' },
      auth: { user: { name: '', email: 'bad' } },
    });
    expect(loadState()).toEqual({
      preferences: { categories: ['science'], sources: ['news'], hashtags: ['space'] },
    });
  });

  it('rejects favorites with unsafe links', () => {
    const item = makeContentItem({ url: 'javascript:alert(1)' });
    save({ favorites: { ids: [item.id], items: { [item.id]: item } } });
    expect(loadState().favorites).toBeUndefined();
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    } as unknown as Storage;
    expect(loadState(broken)).toEqual({});
    expect(loadState(undefined)).toEqual({});
  });
});

describe('persistence middleware', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('saves persisted slices once after a burst of actions', async () => {
    const store = makeStore();
    const setItem = jest.spyOn(Storage.prototype, 'setItem');

    store.dispatch(toggleCategory('science'));
    store.dispatch(toggleFavorite(makeContentItem()));
    store.dispatch(signIn({ name: 'Asha Rao', email: 'ASHA@example.com' }));
    expect(setItem).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(SAVE_DELAY_MS + 10);

    expect(setItem).toHaveBeenCalledTimes(1);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.preferences.categories).toContain('science');
    expect(saved.favorites.ids).toHaveLength(1);
    expect(saved.auth.user.email).toBe('asha@example.com');
    expect(saved).not.toHaveProperty('contentApi');
    setItem.mockRestore();
  });

  it('round-trips through hydrate', async () => {
    const first = makeStore();
    first.dispatch(toggleCategory('health'));
    await jest.advanceTimersByTimeAsync(SAVE_DELAY_MS + 10);

    const second = makeStore();
    second.dispatch(hydrated(loadState()));

    expect(second.getState().preferences).toEqual(first.getState().preferences);
    expect(second.getState().app.hydrated).toBe(true);
  });
});
