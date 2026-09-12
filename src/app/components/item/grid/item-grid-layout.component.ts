import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal, TemplateRef } from '@angular/core';
import { LowerCasePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemTypeNavComponent } from '../type-nav/item-type-nav.component';
import { ItemFiltersComponent } from '../filters/item-filters.component';
import { IItem, ItemType } from 'skygame-data';

/** Emitted by hosts that let their item template be clicked rather than followed. */
export type ItemClickEvent = { event: MouseEvent, item: IItem };

export const ITEM_GRID_CATEGORIES: ReadonlyArray<{ type: ItemType; svgIcon: string }> = [
  { type: ItemType.Outfit,        svgIcon: 'outfit' },
  { type: ItemType.Shoes,         svgIcon: 'shoes' },
  { type: ItemType.OutfitShoes,   svgIcon: 'outfit-shoes' },
  { type: ItemType.Mask,          svgIcon: 'mask' },
  { type: ItemType.FaceAccessory, svgIcon: 'face-acc' },
  { type: ItemType.Necklace,      svgIcon: 'necklace' },
  { type: ItemType.Hair,          svgIcon: 'hair' },
  { type: ItemType.HairAccessory, svgIcon: 'hair-acc' },
  { type: ItemType.HeadAccessory, svgIcon: 'head-acc' },
  { type: ItemType.Cape,          svgIcon: 'cape' },
  { type: ItemType.Held,          svgIcon: 'held' },
  { type: ItemType.Furniture,     svgIcon: 'cup' },
  { type: ItemType.Prop,          svgIcon: 'prop' },
  { type: ItemType.Emote,         svgIcon: 'emote' },
  { type: ItemType.Stance,        svgIcon: 'stance' },
  { type: ItemType.Call,          svgIcon: 'call' },
  { type: ItemType.Music,         svgIcon: 'sheet' },
];

/** The item types the layout can show, for hosts that build their own pool. */
export const ITEM_GRID_TYPES: ReadonlySet<ItemType> = new Set(ITEM_GRID_CATEGORIES.map(c => c.type));

@Component({
  selector: 'app-item-grid-layout',
  templateUrl: './item-grid-layout.component.html',
  styleUrl: './item-grid-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, LowerCasePipe, MatIcon, ItemTypePipe, ItemTypeNavComponent, ItemFiltersComponent]
})
export class ItemGridLayoutComponent implements OnInit {
  readonly categories = ITEM_GRID_CATEGORIES;

  readonly items = input.required<ReadonlyArray<IItem>>();
  readonly itemTemplate = input.required<TemplateRef<{ $implicit: IItem }>>();
  readonly initialCategory = input<ItemType>(ItemType.Outfit);
  /** Opt in to the filter panel; hosts that only browse leave it off. */
  readonly filterable = input<boolean>(false);

  readonly categoryChanged = output<ItemType>();
  /** The items of the active category that survive the filters, in display order. */
  readonly shownItemsChanged = output<ReadonlyArray<IItem>>();

  readonly active = signal<ItemType>(ItemType.Outfit);

  /** The panel stays mounted while collapsed so its filters keep applying. */
  readonly showFilters = signal(false);

  /** GUIDs passing the filter panel; null while the panel is off or has not run. */
  private readonly _matched = signal<ReadonlySet<string> | null>(null);

  private readonly _route = inject(ActivatedRoute);

  readonly _itemsByType = computed(() => {
    const sorted = ItemHelper.sortItems(this.items().slice());
    const m = new Map<ItemType, IItem[]>();
    for (const item of sorted) {
      const arr = m.get(item.type) ?? [];
      arr.push(item);
      m.set(item.type, arr);
    }
    return m;
  });

  readonly visibleCategories = computed(() => {
    const byType = this._itemsByType();
    return ITEM_GRID_CATEGORIES.filter(c => (byType.get(c.type)?.length ?? 0) > 0);
  });

  readonly categoryItems = computed(() => this._itemsByType().get(this.active()) ?? []);

  readonly activeItems = computed<ReadonlyArray<IItem>>(() => {
    const items = this.categoryItems();
    const matched = this._matched();
    return matched ? items.filter(i => matched.has(i.guid)) : items;
  });

  /** True while the filters narrow the pool handed to the panel. */
  readonly hasActiveFilters = computed(() => {
    const matched = this._matched();
    return !!matched && matched.size !== this.items().length;
  });

  readonly isFiltered = computed(() => this.activeItems().length !== this.categoryItems().length);
  readonly activeCategory = computed(() => ITEM_GRID_CATEGORIES.find(c => c.type === this.active()) ?? this.visibleCategories()[0]);
  readonly activeUnlocked = computed(() => this.activeItems().filter(i => i.unlocked).length);
  readonly categoryCounts = computed<Map<ItemType, { unlocked: number; total: number }>>(() => {
    const m = new Map<ItemType, { unlocked: number; total: number }>();
    const byType = this._itemsByType();
    for (const c of ITEM_GRID_CATEGORIES) {
      const items = byType.get(c.type) ?? [];
      m.set(c.type, { unlocked: items.filter(i => i.unlocked).length, total: items.length });
    }
    return m;
  });

  ngOnInit() {
    this.showFilters.set(this._route.snapshot.queryParamMap.get('f') === '1');
    const initial = this.initialCategory();
    const visible = this.visibleCategories();
    const hasInitial = visible.some(c => c.type === initial);
    this.active.set(hasInitial ? initial : (visible[0]?.type ?? initial));
  }

  selectCategory(type: ItemType): void {
    this.active.set(type);
    this.categoryChanged.emit(type);
    this.shownItemsChanged.emit(this.activeItems());
  }

  toggleFilters(evt: Event): void {
    evt.preventDefault();
    evt.stopImmediatePropagation();

    const show = !this.showFilters();
    this.showFilters.set(show);

    const url = new URL(location.href);
    url.searchParams.set('f', show ? '1' : '0');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  onMatchedChange(matched: ReadonlySet<string>): void {
    this._matched.set(matched);
    this.shownItemsChanged.emit(this.activeItems());
  }
}
