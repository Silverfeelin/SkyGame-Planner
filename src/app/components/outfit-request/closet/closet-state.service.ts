import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { IItem, ItemType, ItemSize } from 'skygame-data';
import { IDye } from '@app/interfaces/dye.interface';
import { slotSwatch } from '@app/components/item/dye-versions/dye-swatches';

export type RequestColor = 'r' | 'y' | 'g' | 'b';
export type ClosetMode = 'all' | 'closet';
export type ClosetGroupBy = 'type' | 'season' | 'event' | 'realm';
export type ClosetView = ClosetGroupBy | 'results';
export type CopyImageMode = 'request' | 'square' | 'closet' | 'template';
export interface ISelection {
  [guid: string]: IItem;
}

/** Signal-based store for the closet/request pages.
 *  Provided by the host component (ClosetComponent / ClosetRequestComponent)
 *  so each page gets its own isolated instance. */
@Injectable()
export class ClosetStateService {

  // ── Item catalog ──────────────────────────────────────────────────────────
  readonly allItems = signal<IItem[]>([]);
  readonly itemMap = signal<Record<string, IItem>>({});
  readonly items = signal<Partial<Record<string, IItem[]>>>({});

  /** Items that are currently acquirable in-game (TS, RS, events, season). */
  readonly ongoingItems = signal<Record<string, IItem>>({});

  // ── Selection ─────────────────────────────────────────────────────────────
  readonly selectedR = signal<ISelection>({});
  readonly selectedY = signal<ISelection>({});
  readonly selectedG = signal<ISelection>({});
  readonly selectedB = signal<ISelection>({});
  readonly selectedAll = computed<ISelection>(() => ({
    ...this.selectedR(),
    ...this.selectedY(),
    ...this.selectedG(),
    ...this.selectedB(),
  }));
  readonly selections: Record<RequestColor, WritableSignal<ISelection>> = {
    r: this.selectedR, y: this.selectedY, g: this.selectedG, b: this.selectedB
  };

  readonly dyes = signal<Record<string, IDye[]>>({});
  /** Per item, the color of each dye slot with its blend applied; undefined for undyed slots. */
  readonly dyeSwatches = computed(() => {
    const swatches: Record<string, (string | undefined)[]> = {};
    for (const [guid, dyes] of Object.entries(this.dyes())) { swatches[guid] = dyes.map(slotSwatch); }
    return swatches;
  });

  // ── Availability (from shared closet link) ────────────────────────────────
  readonly available = signal<ISelection | undefined>(undefined);

  // ── Warnings ──────────────────────────────────────────────────────────────
  readonly selectionHasHidden = computed(() => {
    const hidden = this.hidden();
    const all = this.selectedAll();
    return Object.keys(hidden).some(g => !!all[g]);
  });
  readonly selectionHasUnavailable = computed(() => {
    const avail = this.available();
    if (!avail) { return false; }
    return Object.keys(this.selectedAll()).some(g => !avail[g]);
  });

  // ── User preferences (localStorage) ──────────────────────────────────────
  /** Items hidden from the user's closet. */
  readonly hidden = signal<Record<string, boolean>>(
    (JSON.parse(localStorage.getItem('closet.hidden') || '[]') as string[])
      .reduce((m, g) => (m[g] = true, m), {} as Record<string, boolean>)
  );

  readonly showOngoing = signal(localStorage.getItem('closet.show-ongoing') === '1');
  readonly columns = signal(+(localStorage.getItem('closet.columns') ?? 0) || 6);
  readonly closetMode = signal<ClosetMode>((localStorage.getItem('closet.show-mode') as ClosetMode) || 'all');
  readonly itemSize = signal<ItemSize>((localStorage.getItem('closet.item-size') as ItemSize) || 'small');
  readonly itemSizePx = computed(() => this.itemSize() === 'small' ? 32 : 64);
  readonly shouldSync = signal(localStorage.getItem('closet.sync') === '1');
  readonly hideIap = signal(false); // Not persisted (see legacy comment)
  readonly groupBy = signal<ClosetGroupBy>((localStorage.getItem('closet.group-by') as ClosetGroupBy) || 'type');

  // ── Active color ──────────────────────────────────────────────────────────
  readonly color = signal<RequestColor | undefined>('r');

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly modifyingCloset = signal(false);
  readonly showingColorPicker = signal(false);
  readonly showingBackgroundPicker = signal(false);
  readonly showingImagePicker = signal(false);
  readonly showingDyePicker = signal(false);
  readonly dyeItem = signal<IItem | undefined>(undefined);
  readonly isRendering = signal(0);
  readonly lastLink = signal<string | undefined>(undefined);
  readonly typeFolded = signal<Record<string, boolean>>({});
  /** Groups the user opened (true) or closed (false), by view. */
  readonly groupFolds = signal<Record<string, boolean>>({});
  /** Per view, whether groups without their own fold state are open. Search results start open, the other views folded. */
  readonly groupsOpenByDefault = signal<Partial<Record<ClosetView, boolean>>>({ results: true });
  readonly allGroupsOpen = computed(() => {
    const view = this.view();
    if (!this.groupsOpenByDefault()[view]) { return false; }
    const prefix = `${view}:`;
    return !Object.entries(this.groupFolds()).some(([key, open]) => !open && key.startsWith(prefix));
  });

  // ── Search ────────────────────────────────────────────────────────────────
  readonly searchText = signal('');
  /** Matches in order of relevance. */
  readonly searchResults = signal<Record<string, IItem> | undefined>(undefined);
  /** What the grid shows: the search results while searching, else the chosen grouping. */
  readonly view = computed<ClosetView>(() => this.searchResults() ? 'results' : this.groupBy());

  // ── Type bar ──────────────────────────────────────────────────────────────
  readonly activeType = signal<ItemType | undefined>(undefined);
  /** Grouped views have no type sections to jump to, so picking a type narrows the grid there instead. */
  readonly typeFilter = computed(() => this.view() !== 'type' ? this.activeType() : undefined);

  /** Whether the closet settings keep this item out of the grid, apart from folding, search and type filters. */
  isHiddenFromCloset(item: IItem, requesting: boolean): boolean {
    if (requesting || this.modifyingCloset()) { return false; }
    return this.closetMode() === 'closet' && !!this.hidden()[item.guid]
      && !this.selectedAll()[item.guid]
      && !(this.showOngoing() && this.ongoingItems()[item.guid]);
  }

  isGroupOpen(key: string): boolean {
    return this.groupFolds()[this._groupFoldKey(key)] ?? !!this.groupsOpenByDefault()[this.view()];
  }

  toggleGroup(key: string): void {
    const open = this.isGroupOpen(key);
    this.groupFolds.update(m => ({ ...m, [this._groupFoldKey(key)]: !open }));
  }

  setAllGroupsOpen(open: boolean): void {
    const view = this.view();
    const prefix = `${view}:`;
    this.groupFolds.update(m => Object.fromEntries(Object.entries(m).filter(([key]) => !key.startsWith(prefix))));
    this.groupsOpenByDefault.update(m => ({ ...m, [view]: open }));
  }

  /** Results reuse the season, event and realm keys, but fold separately from those views. */
  private _groupFoldKey(key: string): string {
    return `${this.view()}:${key}`;
  }

  // ── Persist helpers ───────────────────────────────────────────────────────

  persistHidden(): void {
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden())));
  }

  persistPrefs(): void {
    localStorage.setItem('closet.show-ongoing', this.showOngoing() ? '1' : '0');
    localStorage.setItem('closet.columns', `${this.columns()}`);
    localStorage.setItem('closet.show-mode', this.closetMode());
    localStorage.setItem('closet.item-size', this.itemSize());
    localStorage.setItem('closet.sync', this.shouldSync() ? '1' : '0');
    localStorage.setItem('closet.group-by', this.groupBy());
  }

  deselect(item: IItem, color: RequestColor): void {
    this.selections[color].update(m => { const n = { ...m }; delete n[item.guid]; return n; });
    this.lastLink.set(undefined);
  }

  /** Reset selection maps */
  clearSelection(): void {
    this.selectedR.set({});
    this.selectedY.set({});
    this.selectedG.set({});
    this.selectedB.set({});
    this.lastLink.set(undefined);
  }
}
