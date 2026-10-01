/**
 * Controllable stand-in for `next/navigation`, installed for every test in
 * jest.setup.ts. Tests set `mockNavigation.pathname` or call `setSearch()`, and
 * assert on `mockNavigation.router.push / replace`.
 */
export const mockNavigation = {
  pathname: '/',
  searchParams: new URLSearchParams(),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  },
};

export function setSearch(query: string) {
  mockNavigation.searchParams = new URLSearchParams(query);
}

export function resetNavigation() {
  mockNavigation.pathname = '/';
  mockNavigation.searchParams = new URLSearchParams();
  Object.values(mockNavigation.router).forEach((fn) => fn.mockReset());
}
