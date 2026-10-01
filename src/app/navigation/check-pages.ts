import { Routes } from '@angular/router';
import { IPage, ISection, PAGES, SECTIONS } from './pages';

/** Routes that are reached through app flows rather than navigation. */
const UNLISTED = new Set(['/no-data', '/storage', '/dropbox-auth']);

const join = (...parts: Array<string | undefined>) =>
  '/' + parts.map(p => p?.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');

/** Logs a warning for every page link without a route and every route missing from the page list. */
export function checkPages(routes: Routes): void {
  const pagePaths = new Set<string>();
  const redirectPaths = new Set<string>();
  const lazyPrefixes: Array<string> = [];

  const walk = (children: Routes, prefix: string) => {
    for (const route of children) {
      const path = join(prefix, route.path);
      if (route.redirectTo !== undefined) { redirectPaths.add(path); continue; }
      if (route.loadChildren) { lazyPrefixes.push(path); continue; }
      if (route.children) { walk(route.children, path); continue; }
      if (!path.includes(':')) { pagePaths.add(path); }
    }
  };
  walk(routes, '');

  const resolves = (link: string, allowRedirect: boolean) => pagePaths.has(link)
    || (allowRedirect && redirectPaths.has(link))
    || lazyPrefixes.some(p => link.startsWith(p + '/'));

  const internalPages = (Object.entries(PAGES) as Array<[string, IPage]>).filter(([, p]) => !p.external);
  const sections = Object.entries(SECTIONS) as Array<[string, ISection]>;
  const problems: Array<string> = [];

  for (const [id, page] of internalPages) {
    if (!resolves(page.link, false)) { problems.push(`Page '${id}' links to '${page.link}', which is not a page route.`); }
  }
  for (const [id, section] of sections) {
    if (!resolves(section.link, true)) { problems.push(`Section '${id}' links to '${section.link}', which is not a route.`); }
  }

  const listed = new Set([...internalPages.map(([, p]) => p.link), ...sections.map(([, s]) => s.link)]);
  for (const path of pagePaths) {
    if (!listed.has(path) && !UNLISTED.has(path)) { problems.push(`Route '${path}' is missing from PAGES in navigation/pages.ts.`); }
  }

  if (problems.length) { console.warn(`Navigation is out of sync with the routes:\n- ${problems.join('\n- ')}`); }
}
