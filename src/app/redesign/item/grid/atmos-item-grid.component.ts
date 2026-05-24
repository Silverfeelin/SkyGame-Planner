import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { DataService } from '@app/services/data.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { IItem, ItemType } from 'skygame-data';

const CATEGORIES: ReadonlyArray<{ type: ItemType; svgIcon: string }> = [
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
  selector: 'atmos-item-grid',
  templateUrl: './atmos-item-grid.component.html',
  styleUrl: './atmos-item-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, IconComponent, ItemTypePipe]
})
export class AtmosItemGridComponent {
  readonly categories = CATEGORIES;

  private readonly _itemsByType = new Map<ItemType, IItem[]>();
  readonly active = signal<ItemType>(ItemType.Outfit);
  readonly activeItems = computed(() => this._itemsByType.get(this.active()) ?? []);
  readonly activeCategory = computed(() => CATEGORIES.find(c => c.type === this.active()) ?? CATEGORIES[0]);
  readonly activeUnlocked = computed(() => this.activeItems().filter(i => i.unlocked).length);
  readonly categoryCounts = computed<Map<ItemType, { unlocked: number; total: number }>>(() => {
    const m = new Map<ItemType, { unlocked: number; total: number }>();
    for (const c of CATEGORIES) {
      const items = this._itemsByType.get(c.type) ?? [];
      m.set(c.type, { unlocked: items.filter(i => i.unlocked).length, total: items.length });
    }
    return m;
  });

  constructor(private readonly _dataService: DataService) {
    const sorted = ItemHelper.sortItems(this._dataService.itemConfig.items.slice());
    for (const item of sorted) {
      const arr = this._itemsByType.get(item.type) ?? [];
      arr.push(item);
      this._itemsByType.set(item.type, arr);
    }
  }
}
