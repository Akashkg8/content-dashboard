import '@testing-library/jest-dom';

import { server } from './tests/msw/server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  if (typeof window !== 'undefined') window.localStorage.clear();
});
afterAll(() => server.close());
