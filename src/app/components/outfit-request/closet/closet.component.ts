import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-closet',
  templateUrl: './closet.component.html',
  styleUrls: ['./closet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosetComponent {

  items: { [key: string]: Array<IItem> } = {};
  selected: { [key: string]: IItem } = {};
  highlightOwned = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.initializeItems();
    this.highlightOwned = localStorage.getItem('closet.owned') === '1';
  }

  toggleItem(item: IItem): void {
    if (this.selected[item.guid]) {
      delete this.selected[item.guid];
    } else {
    this.selected[item.guid] = item;
    }

    this._changeDetectionRef.markForCheck();
  }

  toggleHighlightOwned(): void {
    this.highlightOwned = !this.highlightOwned;
    localStorage.setItem('closet.owned', this.highlightOwned ? '1' : '0');
  }

  toggleCloset(): void {

  }

  private initializeItems(): void {
    const itemTypes = new Set<ItemType>([
      ItemType.Outfit, ItemType.Shoes,
      ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
      ItemType.Hair, ItemType.Hat,
      ItemType.Cape,
      ItemType.Held, ItemType.Prop
    ]);

    this.items = {};
    for (const type of itemTypes) {
      this.items[type as string] = [];
    }

    for (const item of this._dataService.itemConfig.items) {
      let type = item.type;
      if (type === 'Instrument') { type = ItemType.Held; }
      if (!itemTypes.has(type)) { continue; }

      this.items[type as string].push(item);
    }

    for (const type of itemTypes) {
      this.items[type as string].sort((a, b) => (a.order || 99999) - (b.order || 99999));
    }
  }
}
