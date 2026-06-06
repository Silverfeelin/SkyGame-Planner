export interface INavItem {
  icon: string;
  svgIcon?: string;
  iconUrl?: string;
  label: string;
  link: string;
  exact?: boolean;
}

export const REDESIGN_NAV: ReadonlyArray<INavItem> = [
  { icon: 'home',                            label: 'Sky Planner',  link: '/r',             exact: true },
  { icon: 'today',                           label: 'Daily',        link: '/r/daily' },
  { icon: 'wallet',       svgIcon: 'candle', label: 'Currencies',   link: '/r/currency' },
  { icon: 'checkroom',                       label: 'Items',        link: '/r/item' },
  { icon: 'person',                          label: 'Spirits',      link: '/r/spirit' },
  { icon: 'air',          svgIcon: 'flaps',  label: 'Winged Light', link: '/r/winged-light' },
  { icon: 'map',                             label: 'Realms',       link: '/r/realm' },
  { icon: 'ac_unit',                         label: 'Seasons',      link: '/r/season' },
  { icon: 'celebration',                     label: 'Events',       link: '/r/event' },
  { icon: 'shopping_cart',                   label: 'Shops',        link: '/r/shop' },
  { icon: 'people',                          label: 'Friends',      link: '/r/friend' },
  { icon: 'build',                           label: 'Tools',        link: '/r/tool' }
];

export const REDESIGN_FOOT_NAV: ReadonlyArray<INavItem> = [
  { icon: 'new_releases', label: "What's new", link: '/r/news' },
  { icon: 'settings',     label: 'Settings',   link: '/r/settings' },
  { icon: 'info',         label: 'Info',       link: '/r/info' }
];

export function withSeasonIcon(items: ReadonlyArray<INavItem>, seasonIconUrl: string | undefined): ReadonlyArray<INavItem> {
  if (!seasonIconUrl) return items;
  return items.map(i => i.link === '/r/season' ? { ...i, iconUrl: seasonIconUrl } : i);
}
