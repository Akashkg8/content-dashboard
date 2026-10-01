import type { ContentSource, FeedPage } from '@/types/content';

import { feedReducer, reorderFeed } from './feedSlice';
import { applyOrder, interleavePages } from './selectors';
import { makeContentItem } from '../../../tests/fixtures/content';

const page = (source: ContentSource, titles: string[]): FeedPage => ({
  items: titles.map((title) => makeContentItem({ source, title, id: `${source}:${title}` })),
  page: 1,
  hasMore: false,
  origins: {},
});
const titles = (items: { title: string }[]) => items.map((item) => item.title);

describe('interleavePages', () => {
  it('alternates sources round-robin within each page', () => {
    const merged = interleavePages([
      [page('news', ['n1', 'n2'])],
      [page('movie', ['m1'])],
      [page('social', ['s1', 's2', 's3'])],
    ]);
    expect(titles(merged)).toEqual(['n1', 'm1', 's1', 'n2', 's2', 's3']);
  });

  it('keeps earlier cards in place when a later page arrives', () => {
    const first = interleavePages([[page('news', ['n1'])], [page('movie', ['m1', 'm2'])]]);
    const second = interleavePages([
      [page('news', ['n1']), page('news', ['n2'])],
      [page('movie', ['m1', 'm2']), page('movie', ['m3'])],
    ]);
    expect(titles(second).slice(0, first.length)).toEqual(titles(first));
  });

  it('drops duplicate ids and handles no sources', () => {
    expect(interleavePages([[page('news', ['a'])], [page('news', ['a'])]])).toHaveLength(1);
    expect(interleavePages([])).toEqual([]);
  });
});

describe('applyOrder', () => {
  const items = ['a', 'b', 'c', 'd'].map((id) => makeContentItem({ id, title: id }));

  it('returns the natural order when nothing was dragged', () => {
    expect(titles(applyOrder(items, []))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('puts saved ids first, new items after, and skips ids no longer loaded', () => {
    expect(titles(applyOrder(items, ['c', 'gone', 'a']))).toEqual(['c', 'a', 'b', 'd']);
  });

  it('round-trips with the reorder reducer', () => {
    const ids = items.map((item) => item.id);
    const state = feedReducer(undefined, reorderFeed({ ids, activeId: 'd', overId: 'b' }));
    expect(titles(applyOrder(items, state.order))).toEqual(['a', 'd', 'b', 'c']);
  });
});
