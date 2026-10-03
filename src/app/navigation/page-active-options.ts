import { IsActiveMatchOptions } from '@angular/router';
import { IPage } from './pages';

/** What `routerLinkActiveOptions` derives from `{ exact: true }`; it already compares query params. */
const MATCH_EXACT: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'exact',
  matrixParams: 'ignored',
  fragment: 'ignored'
};

/** What `routerLinkActiveOptions` derives from `{ exact: false }`. */
const MATCH_SUBSET: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'subset',
  matrixParams: 'ignored',
  fragment: 'ignored'
};

/** When a link to this page counts as active. */
export function pageActiveOptions(page: IPage): IsActiveMatchOptions {
  return page.exact ? MATCH_EXACT : MATCH_SUBSET;
}
