export interface INavItem {
  icon: string;
  label: string;
  link: string;
  exact?: boolean;
}

export const REDESIGN_NAV: ReadonlyArray<INavItem> = [
  { icon: 'home',          label: 'Sky Planner',  link: '/r',             exact: true },
  { icon: 'today',         label: 'Daily',        link: '/r/daily' },
  { icon: 'wallet',        label: 'Currency',     link: '/r/currency' },
  { icon: 'checkroom',     label: 'Items',        link: '/r/items' },
  { icon: 'person',        label: 'Spirits',      link: '/r/spirits' },
  { icon: 'air',           label: 'Winged Light', link: '/r/winged-light' },
  { icon: 'map',           label: 'Realms',       link: '/r/realms' },
  { icon: 'ac_unit',       label: 'Seasons',      link: '/r/seasons' },
  { icon: 'celebration',   label: 'Events',       link: '/r/events' },
  { icon: 'shopping_cart', label: 'Shops',        link: '/r/shops' },
  { icon: 'people',        label: 'Friends',      link: '/r/friends' },
  { icon: 'build',         label: 'Tools',        link: '/r/tools' }
];

export const REDESIGN_FOOT_NAV: ReadonlyArray<INavItem> = [
  { icon: 'new_releases', label: "What's new", link: '/r/news' },
  { icon: 'settings',     label: 'Settings',   link: '/r/settings' },
  { icon: 'info',         label: 'Info',       link: '/r/info' }
];
