import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { IItem } from 'skygame-data';
import { ItemIconComponent } from '../icon/item-icon.component';
import { SUBICONS_ALL } from '../icon/subicons/item-subicons.component';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { nanoid } from 'nanoid';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { GoalService } from '@app/services/goal.service';
import { IItemCollection, ItemCollectionService } from '@app/services/item-collection.service';

type CollectionFilter = 'all' | 'progress' | 'complete';
type CollectionSort = 'custom' | 'name' | 'progress';

interface ICollectionRow {
  collection: IItemCollection;
  unlocked: number;
  percent: number;
  complete: boolean;
  needsGoals: boolean;
  searchText: string;
}

/** Items shown per collection before the rest hide behind a "+N" button. */
const VISIBLE_ITEMS = 12;
const UNDO_DURATION = 8000;
const MENU_GAP = 4;
const VIEWPORT_MARGIN = 8;

@Component({
  selector: 'app-item-collection',
  templateUrl: './item-collection.component.html',
  styleUrl: './item-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipDirective, RouterLink, MatIcon, CdkDropList, CdkDrag, CdkDragHandle,
    ItemIconComponent, ImageOverlayComponent, SectionQuickActionsComponent
  ]
})
export class ItemCollectionComponent implements OnDestroy {
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly VISIBLE_ITEMS = VISIBLE_ITEMS;

  private readonly _collectionService = inject(ItemCollectionService);
  private readonly _router = inject(Router);
  private readonly _goalService = inject(GoalService);

  readonly collections = signal<Array<IItemCollection>>(this._collectionService.load());
  readonly query = signal('');
  readonly filter = signal<CollectionFilter>('all');
  readonly sort = signal<CollectionSort>('custom');
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly preview = signal<IItemCollection | undefined>(undefined);
  readonly deleted = signal<{ collection: IItemCollection, index: number } | undefined>(undefined);
  readonly focusGuid = signal<string | undefined>(undefined);

  private _undoTimer?: ReturnType<typeof setTimeout>;

  readonly rows = computed<Array<ICollectionRow>>(() => this.collections().map(c => this.createRow(c)));

  readonly counts = computed<Record<CollectionFilter, number>>(() => {
    const rows = this.rows();
    const complete = rows.filter(r => r.complete).length;
    return { all: rows.length, progress: rows.length - complete, complete };
  });

  readonly visibleRows = computed<Array<ICollectionRow>>(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();
    const rows = this.rows().filter(r => {
      if (filter === 'progress' && r.complete) { return false; }
      if (filter === 'complete' && !r.complete) { return false; }
      return !query || r.searchText.includes(query);
    });
    switch (this.sort()) {
      case 'name': return rows.sort((a, b) => a.collection.name.localeCompare(b.collection.name));
      case 'progress': return rows.sort((a, b) => b.percent - a.percent);
      default: return rows;
    }
  });

  /** Dragging only maps onto the stored order when every collection is shown in it. */
  readonly canReorder = computed(() => this.sort() === 'custom' && this.filter() === 'all' && !this.query().trim());

  readonly filters: ReadonlyArray<{ id: CollectionFilter, label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'progress', label: 'In progress' },
    { id: 'complete', label: 'Complete' }
  ];

  constructor() {
    this.redirectItemsFromUrl();
    this.readFocusFromUrl();
  }

  ngOnDestroy(): void {
    clearTimeout(this._undoTimer);
  }

  importCollectionFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files.length) { return; }
      const file = target.files[0];
      const json = await file.text();
      try {
        const collections: Array<IItemCollection> = this._collectionService.deserialize(json);
        if (!collections.length) { throw new Error('No collections found in file.'); }
        if (!confirm(`You're trying to import ${collections.length} new collection${collections.length === 1 ? '' : 's'}. Continue?`)) { return; }
        collections.forEach(c => c.guid = nanoid(10));
        this.saveCollections([...this.collections(), ...collections]);
      } catch {
        alert('Failed to import collection. Please ensure the file is a valid collection.');
      }
    };
    input.click();
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as CollectionSort);
  }

  onDropped(evt: CdkDragDrop<unknown, unknown, IItemCollection>): void {
    this.moveTo(evt.item.data, evt.currentIndex);
  }

  moveCollection(collection: IItemCollection, offset: number, menu: HTMLElement): void {
    menu.hidePopover();
    const index = this.collections().indexOf(collection);
    this.sort.set('custom');
    this.moveTo(collection, index + offset);
  }

  isFirst(collection: IItemCollection): boolean {
    return this.collections()[0] === collection;
  }

  isLast(collection: IItemCollection): boolean {
    return this.collections().at(-1) === collection;
  }

  showAllItems(collection: IItemCollection): void {
    this.expanded.update(set => new Set(set).add(collection.guid));
  }

  shownItems(collection: IItemCollection): Array<IItem> {
    return this.expanded().has(collection.guid) ? collection.items : collection.items.slice(0, VISIBLE_ITEMS);
  }

  gotoCalculator(collection: IItemCollection): void {
    const ids = ItemHelper.serializeQuery(collection.items);
    void this._router.navigate(['/item/unlock-calculator'], { queryParams: { items: ids } });
  }

  exportCollection(collection: IItemCollection, menu: HTMLElement): void {
    menu.hidePopover();
    const data = this._collectionService.serialize([collection]);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sky-planner-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  deleteCollection(collection: IItemCollection, menu: HTMLElement): void {
    menu.hidePopover();
    const collections = this.collections();
    const index = collections.indexOf(collection);
    if (index < 0) { return; }
    this.saveCollections(collections.filter(c => c !== collection));
    this.deleted.set({ collection, index });
    clearTimeout(this._undoTimer);
    this._undoTimer = setTimeout(() => this.deleted.set(undefined), UNDO_DURATION);
  }

  undoDelete(): void {
    const deleted = this.deleted();
    if (!deleted) { return; }
    clearTimeout(this._undoTimer);
    const collections = [...this.collections()];
    collections.splice(deleted.index, 0, deleted.collection);
    this.saveCollections(collections);
    this.deleted.set(undefined);
  }

  planAsGoals(collection: IItemCollection): void {
    const guids = collection.items.filter(i => !i.unlocked).map(i => i.guid);
    this._goalService.add(...guids);
    void this._router.navigate(['/item/goals']);
  }

  /** The menu sits in the top layer, so it is placed in viewport coordinates below its trigger. */
  onMenuToggle(event: Event, trigger: HTMLElement): void {
    if ((event as ToggleEvent).newState !== 'open') { return; }
    const menu = event.target as HTMLElement;
    const anchor = trigger.getBoundingClientRect();
    const box = menu.getBoundingClientRect();
    const left = Math.min(anchor.right - box.width, window.innerWidth - box.width - VIEWPORT_MARGIN);
    const below = anchor.bottom + MENU_GAP;
    const top = below + box.height > window.innerHeight - VIEWPORT_MARGIN ? anchor.top - box.height - MENU_GAP : below;
    menu.style.left = `${Math.max(VIEWPORT_MARGIN, left)}px`;
    menu.style.top = `${Math.max(VIEWPORT_MARGIN, top)}px`;
  }

  private createRow(collection: IItemCollection): ICollectionRow {
    const items = collection.items;
    const unlocked = items.filter(i => i.unlocked).length;
    const complete = items.length > 0 && unlocked === items.length;
    return {
      collection, unlocked, complete,
      percent: items.length ? unlocked / items.length * 100 : 0,
      needsGoals: items.some(i => !i.unlocked && !this._goalService.has(i.guid)),
      searchText: [collection.name, collection.description, ...items.map(i => i.name)].join(' ').toLowerCase()
    };
  }

  private moveTo(collection: IItemCollection, index: number): void {
    const collections = [...this.collections()];
    const from = collections.indexOf(collection);
    if (from < 0 || index < 0 || index >= collections.length || index === from) { return; }
    collections.splice(from, 1);
    collections.splice(index, 0, collection);
    this.saveCollections(collections);
  }

  /** Older links create a collection from `?items=` on this page. */
  private redirectItemsFromUrl(): void {
    const items = new URL(location.href).searchParams.get('items');
    if (!items) { return; }
    void this._router.navigate(['/item/collection/add'], { queryParams: { items }, replaceUrl: true });
  }

  private readFocusFromUrl(): void {
    const guid = new URL(location.href).searchParams.get('focus');
    if (!guid || !this.collections().some(c => c.guid === guid)) { return; }
    this.focusGuid.set(guid);

    // Wait for the list to render before it can be scrolled to.
    setTimeout(() => {
      document.querySelector(`[data-collection="${guid}"]`)?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
  }

  private saveCollections(collections: Array<IItemCollection>): void {
    this.collections.set(collections);
    this._collectionService.save(collections);
  }
}
