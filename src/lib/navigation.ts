import { Flame, Heart, Newspaper, SlidersHorizontal, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: '/' | '/trending' | '/favorites' | '/settings';
  label: string;
  icon: LucideIcon;
}

/** Primary sections, shared by the desktop sidebar and the mobile drawer. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'My feed', icon: Newspaper },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/settings', label: 'Settings', icon: SlidersHorizontal },
];

/** `/` only matches itself; other sections also match their sub-routes. */
export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}
