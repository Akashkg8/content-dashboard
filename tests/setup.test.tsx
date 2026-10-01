import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useEffect, useState } from 'react';

import type { FeedPage } from '@/types/content';

import { server } from './msw/server';

/** Tiny component that fetches like the real app will, through `/api/*`. */
function NewsTitles() {
  const [state, setState] = useState<'loading' | 'error' | FeedPage>('loading');
  useEffect(() => {
    fetch('/api/news?page=1')
      .then((res) => (res.ok ? (res.json() as Promise<FeedPage>) : Promise.reject(res.status)))
      .then(setState, () => setState('error'));
  }, []);
  if (state === 'loading') return <p>Loading</p>;
  if (state === 'error') return <p role="alert">Failed</p>;
  return (
    <ul>
      {state.items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

describe('test setup', () => {
  it('runs in jsdom with jest-dom matchers', () => {
    render(<p>hello</p>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('serves default MSW handlers to fetch', async () => {
    render(<NewsTitles />);
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
  });

  it('lets a test override a handler for error states', async () => {
    server.use(http.get('*/api/news', () => new HttpResponse(null, { status: 500 })));
    render(<NewsTitles />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed');
  });

  it('isolates localStorage between tests', () => {
    expect(window.localStorage.length).toBe(0);
    window.localStorage.setItem('leak', '1');
  });
});
