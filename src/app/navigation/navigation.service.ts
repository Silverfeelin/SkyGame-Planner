import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DataService } from '@app/services/data.service';
import { FOOTER_PAGES, IPage, ISection, PageId, SECTIONS, SectionId, getPage } from './pages';
import { pageActiveOptions } from './page-active-options';

export interface INavPage extends IPage {
  id: PageId;
}

export interface INavSection {
  id: SectionId;
  label: string;
  link: string;
  icon: string;
  svgIcon?: string;
  iconUrl?: string;
  pages: ReadonlyArray<INavPage>;
}

/** Sidebar and drawer navigation: the section tree, the current section and which sections are expanded. */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly _router = inject(Router);
  private readonly _dataService = inject(DataService);

  readonly sections: ReadonlyArray<INavSection> = this.buildSections();
  readonly footer: ReadonlyArray<INavPage> = FOOTER_PAGES.map(id => ({ ...getPage(id), id }));

  /** Current URL path, without query or fragment. Set by the constructor, so the first section counts as a change. */
  readonly path = signal('');
  readonly currentSection = computed(() => resolveSection(this.path()));

  private readonly _expanded = signal<ReadonlySet<SectionId>>(new Set());
  readonly expanded = this._expanded.asReadonly();

  private readonly _activePages = signal<ReadonlySet<PageId>>(new Set());
  readonly activePages = this._activePages.asReadonly();

  constructor() {
    this.onNavigated();
    this._router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.onNavigated());
  }

  toggle(id: SectionId): void {
    this._expanded.update(set => {
      const next = new Set(set);
      if (!next.delete(id)) { next.add(id); }
      return next;
    });
  }

  expand(id: SectionId): void {
    if (this._expanded().has(id)) { return; }
    this._expanded.update(set => new Set(set).add(id));
  }

  private onNavigated(): void {
    const previous = this.currentSection();
    this.path.set(toPath(this._router.url));

    // Only a change of section opens it, so a section the user closed stays closed while they browse inside it.
    // It also closes every other section, so the tree doesn't keep growing.
    const current = this.currentSection();
    if (current && current !== previous) { this._expanded.set(new Set([current])); }

    const active = new Set<PageId>();
    for (const page of this.sections.flatMap(s => s.pages)) {
      if (page.external) { continue; }
      const tree = this._router.createUrlTree([page.link], { queryParams: page.queryParams });
      if (this._router.isActive(tree, pageActiveOptions(page))) { active.add(page.id); }
    }
    this._activePages.set(active);
  }

  private buildSections(): ReadonlyArray<INavSection> {
    const seasonIconUrl = this._dataService.seasonConfig.items.at(-1)?.iconUrl;
    return (Object.entries(SECTIONS) as Array<[SectionId, ISection]>).map(([id, section]) => {
      const pages = section.pages
        .map(pageId => ({ ...getPage(pageId), id: pageId }))
        .filter(page => page.visible?.(this._dataService) ?? true);
      return {
        id,
        label: section.label,
        link: section.link,
        icon: section.icon,
        svgIcon: section.svgIcon,
        iconUrl: id === 'season' ? seasonIconUrl : undefined,
        pages: [...pages.filter(p => !p.external), ...pages.filter(p => p.external)]
      };
    });
  }
}

function toPath(url: string): string {
  return url.split(/[?#;]/)[0] || '/';
}

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** The longest matching prefix wins; on a tie the first section in sidebar order keeps it. */
function longestMatch(path: string, candidates: Array<[SectionId, string]>): SectionId | null {
  let best: SectionId | null = null;
  let bestLength = 0;
  for (const [id, prefix] of candidates) {
    if (prefix.length > bestLength && matchesPrefix(path, prefix)) {
      best = id;
      bestLength = prefix.length;
    }
  }
  return best;
}

/**
 * Section links come first, so `/realm/cr-tracker` belongs to Realms even though Daily lists it too.
 * Page links only catch routes outside every section link, such as `/ts` and `/area/:guid`.
 */
function resolveSection(path: string): SectionId | null {
  if (path === '/') { return 'home'; }
  const sections = Object.entries(SECTIONS) as Array<[SectionId, ISection]>;

  const sectionPrefixes = sections.flatMap(([id, s]) =>
    [s.link, ...(s.match ?? [])].filter(p => p !== '/').map(p => [id, p] as [SectionId, string]));
  const bySection = longestMatch(path, sectionPrefixes);
  if (bySection) { return bySection; }

  const pagePrefixes = sections.flatMap(([id, s]) =>
    s.pages.map(getPage).filter(p => !p.external).map(p => [id, p.link] as [SectionId, string]));
  return longestMatch(path, pagePrefixes);
}
