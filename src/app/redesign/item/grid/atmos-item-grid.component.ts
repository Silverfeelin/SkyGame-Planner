import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IconComponent } from '@app/components/icon/icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { DataService } from '@app/services/data.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { IItem, ItemType } from 'skygame-data';

const CATEGORIES: ReadonlyArray<{ type: ItemType; icon: string }> = [
  { type: ItemType.Outfit,        icon: 'checkroom' },
  { type: ItemType.Shoes,         icon: 'footprint' },
  { type: ItemType.OutfitShoes,   icon: 'checkroom' },
  { type: ItemType.Mask,          icon: 'theater_comedy' },
  { type: ItemType.FaceAccessory, icon: 'face' },
  { type: ItemType.Necklace,      icon: 'diamond' },
  { type: ItemType.Hair,          icon: 'person' },
  { type: ItemType.HairAccessory, icon: 'face_retouching_natural' },
  { type: ItemType.HeadAccessory, icon: 'sports_baseball' },
  { type: ItemType.Cape,          icon: 'dry_cleaning' },
  { type: ItemType.Held,          icon: 'back_hand' },
  { type: ItemType.Furniture,     icon: 'chair' },
  { type: ItemType.Prop,          icon: 'extension' },
  { type: ItemType.Emote,         icon: 'sentiment_satisfied' },
  { type: ItemType.Stance,        icon: 'accessibility_new' },
  { type: ItemType.Call,          icon: 'campaign' },
  { type: ItemType.Music,         icon: 'music_note' },
  { type: ItemType.Spell,         icon: 'auto_fix_high' },
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
