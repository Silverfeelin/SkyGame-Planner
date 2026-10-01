import { FOOTER_PAGES, SECTIONS, getPage } from '@app/navigation/pages';

export interface INavItem {
  icon: string;
  svgIcon?: string;
  iconUrl?: string;
  label: string;
  link: string;
  exact?: boolean;
  external?: boolean;
}

export const REDESIGN_NAV: ReadonlyArray<INavItem> = Object.values(SECTIONS).map(({ pages, ...item }) => item);

export const REDESIGN_FOOT_NAV: ReadonlyArray<INavItem> = FOOTER_PAGES.map(id => {
  const { icon, svgIcon, label, link, external } = getPage(id);
  return { icon, svgIcon, label, link, external };
});

export function withSeasonIcon(items: ReadonlyArray<INavItem>, seasonIconUrl: string | undefined): ReadonlyArray<INavItem> {
  if (!seasonIconUrl) return items;
  return items.map(i => i.link === '/season' ? { ...i, iconUrl: seasonIconUrl } : i);
}
