export interface INavItem {
  icon: string;
  svgIcon?: string;
  iconUrl?: string;
  label: string;
  link: string;
  exact?: boolean;
}

export const REDESIGN_NAV: ReadonlyArray<INavItem> = [
  { icon: 'home',                            label: 'Sky Planner',  link: '/',              exact: true },
  { icon: 'today',                           label: 'Daily',        link: '/daily' },
  { icon: 'wallet',       svgIcon: 'candle', label: 'Currencies',   link: '/currency' },
  { icon: 'checkroom',                       label: 'Items',        link: '/item' },
  { icon: 'person',                          label: 'Spirits',      link: '/spirit' },
  { icon: 'air',          svgIcon: 'flaps',  label: 'Winged Light', link: '/winged-light' },
  { icon: 'map',                             label: 'Realms',       link: '/realm' },
  { icon: 'ac_unit',                         label: 'Seasons',      link: '/season' },
  { icon: 'celebration',                     label: 'Events',       link: '/event' },
  { icon: 'shopping_cart',                   label: 'Shops',        link: '/shop' },
  { icon: 'people',                          label: 'Friends',      link: '/friend' },
  { icon: 'build',                           label: 'Tools',        link: '/tool' }
];

export const REDESIGN_FOOT_NAV: ReadonlyArray<INavItem> = [
  { icon: 'new_releases', label: "What's new", link: '/news' },
  { icon: 'settings',     label: 'Settings',   link: '/settings' },
  { icon: 'info',         label: 'Info',       link: '/info' }
];

export function withSeasonIcon(items: ReadonlyArray<INavItem>, seasonIconUrl: string | undefined): ReadonlyArray<INavItem> {
  if (!seasonIconUrl) return items;
  return items.map(i => i.link === '/season' ? { ...i, iconUrl: seasonIconUrl } : i);
}
