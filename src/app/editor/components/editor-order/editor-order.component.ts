import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-editor-order',
  templateUrl: './editor-order.component.html',
  styleUrls: ['./editor-order.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorOrderComponent {
  types: Array<string> = Object.keys(ItemType);
  typeItems: { [key: string]: Array<IItem> } = {};
  typeSwaps: { [key: string]: Array<{item: IItem, old: number, new: number}> } = {};

  swapping?: IItem;

  constructor(
    private readonly _dataService: DataService,
  ) {
    this.typeItems = {};
    for (const type in ItemType) { this.typeItems[type] = []; }

    _dataService.itemConfig.items.forEach(item => {
      let type = item.type;
      this.typeItems[type].push(item);
      (item as any)._initialOrder = item.order;
    });

    for (const type in ItemType) { ItemHelper.sortItems(this.typeItems[type]); }
    for (const type in ItemType) { this.calculateSwaps(type as ItemType); }
  }

  swap(type: string, item: IItem): void {
    // Start
    if (!this.swapping) {
      this.swapping = item;
      return;
    }

    // Cancel
    if (item === this.swapping) {
      this.swapping = undefined;
      return;
    }

    // Move this.swapping in front of item.
    const items = this.typeItems[type];
    const swappingIndex = items.indexOf(this.swapping);
    const itemIndex = items.indexOf(item);
    items.splice(swappingIndex, 1);
    items.splice(itemIndex > swappingIndex ? itemIndex - 1 : itemIndex, 0, this.swapping);
    this.swapping = undefined;

    this.calculateSwaps(type as ItemType);
  }

  calculateSwaps(type: ItemType): void {
    const items = this.typeItems[type];

    const swaps: Array<{item: IItem, old: number, new: number}> = [];
    this.typeSwaps[type] = swaps;

    items.forEach((item, i) => {
      item.order = (item as any)._initialOrder;
      const itemOrder = item.order || 99999;
      const prevOrder = items[i - 1]?.order ?? -1;
      const nextOrder = items[i + 1]?.order ?? 99999;

      if (itemOrder < nextOrder && itemOrder > prevOrder) { return; }

      if (prevOrder >= itemOrder) {
        item.order = prevOrder + (Math.abs(nextOrder - prevOrder) > 10 ? 10 : 1);
        swaps.push({ item, old: itemOrder, new: item.order });
      }
    });
  }
}
