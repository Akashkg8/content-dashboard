import '@testing-library/jest-dom';

import { resetNavigation } from './tests/mocks/navigation';
import { server } from './tests/msw/server';

// The App Router hooks need a mounted Next.js router. Tests use a controllable fake instead.
jest.mock('next/navigation', () => {
  const { mockNavigation } = jest.requireActual('./tests/mocks/navigation');
  return {
    usePathname: () => mockNavigation.pathname,
    useSearchParams: () => mockNavigation.searchParams,
    useRouter: () => mockNavigation.router,
  };
});

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetNavigation();
  if (typeof window !== 'undefined') window.localStorage.clear();
});
afterAll(() => server.close());
