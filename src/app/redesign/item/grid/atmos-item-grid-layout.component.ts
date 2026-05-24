import { ChangeDetectionStrategy, Component, computed, input, OnInit, signal, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemHelper } from '@app/helpers/item-helper';
import { IItem, ItemType } from 'skygame-data';

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

@Component({
  selector: 'atmos-item-grid-layout',
  templateUrl: './atmos-item-grid-layout.component.html',
  styleUrl: './atmos-item-grid-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatIcon, ItemTypePipe]
})
export class AtmosItemGridLayoutComponent implements OnInit {
  readonly categories = ITEM_GRID_CATEGORIES;

  readonly items = input.required<ReadonlyArray<IItem>>();
  readonly itemTemplate = input.required<TemplateRef<{ $implicit: IItem }>>();
  readonly initialCategory = input<ItemType>(ItemType.Outfit);

  readonly active = signal<ItemType>(ItemType.Outfit);

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

  readonly activeItems = computed(() => this._itemsByType().get(this.active()) ?? []);
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
    const initial = this.initialCategory();
    const visible = this.visibleCategories();
    const hasInitial = visible.some(c => c.type === initial);
    this.active.set(hasInitial ? initial : (visible[0]?.type ?? initial));
  }
}
