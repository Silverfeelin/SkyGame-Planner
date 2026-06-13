import { Injectable, signal, computed } from '@angular/core';
import { IItem, ItemType, ItemSize } from 'skygame-data';

export type RequestColor = 'r' | 'y' | 'g' | 'b';
export type ClosetMode = 'all' | 'closet';
export type CopyImageMode = 'request' | 'square' | 'closet' | 'template';
export type DyeColor = 'red' | 'purple' | 'blue' | 'cyan' | 'green' | 'yellow' | 'black' | 'white';
export const DYE_COLORS: DyeColor[] = ['red', 'purple', 'blue', 'cyan', 'green', 'yellow', 'black', 'white'];

export interface IDye {
  primary?: DyeColor;
  secondary?: DyeColor;
}

export interface ISelection {
  [guid: string]: IItem;
}

/** Signal-based store for the closet/request pages.
 *  Provided by the host component (AtmosClosetComponent / AtmosClosetRequestComponent)
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

  readonly dyes = signal<Record<string, IDye[]>>({});
  readonly dyeClasses = signal<Record<string, (string | undefined)[]>>({});

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

  readonly hideUnselected = signal(localStorage.getItem('closet.hide-unselected') === '1');
  readonly showOngoing = signal(localStorage.getItem('closet.show-ongoing') === '1');
  readonly columns = signal(+(localStorage.getItem('closet.columns') ?? 0) || 6);
  readonly closetMode = signal<ClosetMode>((localStorage.getItem('closet.show-mode') as ClosetMode) || 'all');
  readonly itemSize = signal<ItemSize>((localStorage.getItem('closet.item-size') as ItemSize) || 'small');
  readonly itemSizePx = computed(() => this.itemSize() === 'small' ? 32 : 64);
  readonly shouldSync = signal(localStorage.getItem('closet.sync') === '1');
  readonly hideIap = signal(false); // Not persisted (see legacy comment)

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

  // ── Search ────────────────────────────────────────────────────────────────
  readonly searchText = signal('');
  readonly searchResults = signal<Record<string, IItem> | undefined>(undefined);

  // ── Persist helpers ───────────────────────────────────────────────────────

  persistHidden(): void {
    localStorage.setItem('closet.hidden', JSON.stringify(Object.keys(this.hidden())));
  }

  persistPrefs(): void {
    localStorage.setItem('closet.hide-unselected', this.hideUnselected() ? '1' : '0');
    localStorage.setItem('closet.show-ongoing', this.showOngoing() ? '1' : '0');
    localStorage.setItem('closet.columns', `${this.columns()}`);
    localStorage.setItem('closet.show-mode', this.closetMode());
    localStorage.setItem('closet.item-size', this.itemSize());
    localStorage.setItem('closet.sync', this.shouldSync() ? '1' : '0');
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
