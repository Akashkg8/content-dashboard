import { isActivePath } from './navigation';

describe('isActivePath', () => {
  it('matches the feed only on the exact root path', () => {
    expect(isActivePath('/', '/')).toBe(true);
    expect(isActivePath('/trending', '/')).toBe(false);
  });

  it('matches a section and its sub-routes', () => {
    expect(isActivePath('/settings', '/settings')).toBe(true);
    expect(isActivePath('/settings/account', '/settings')).toBe(true);
  });

  it('does not match a section that only shares a prefix', () => {
    expect(isActivePath('/favorites-old', '/favorites')).toBe(false);
  });
});
