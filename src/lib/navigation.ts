import { Flame, Heart, Newspaper, SlidersHorizontal, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: '/' | '/trending' | '/favorites' | '/settings';
  /** Translation key for the visible label. */
  labelKey: 'nav.feed' | 'nav.trending' | 'nav.favorites' | 'nav.settings';
  icon: LucideIcon;
}

/** Primary sections, shared by the desktop sidebar and the mobile drawer. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'nav.feed', icon: Newspaper },
  { href: '/trending', labelKey: 'nav.trending', icon: Flame },
  { href: '/favorites', labelKey: 'nav.favorites', icon: Heart },
  { href: '/settings', labelKey: 'nav.settings', icon: SlidersHorizontal },
];

/** `/` only matches itself; other sections also match their sub-routes. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
