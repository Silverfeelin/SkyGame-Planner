import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IItem, ItemSubtype, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgFor } from '@angular/common';

interface ISwap {item: IItem, prev?: IItem, old: number, new: number};

@Component({
    selector: 'app-editor-order',
    templateUrl: './editor-order.component.html',
    styleUrls: ['./editor-order.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor, NgbTooltip]
})
export class EditorOrderComponent {
  types: Array<string> = [
    'Outfit', 'Shoes',
    'Mask', 'FaceAccessory', 'Necklace',
    'Hair', 'HairAccessory', 'HeadAccessory',
    'Cape',
    'Held', 'Furniture', 'Prop',
    'Emote', 'Stance', 'Call',
    'Music'
  ]
  typeItems: { [key: string]: Array<IItem> } = {};
  typeSwaps: { [key: string]: Array<ISwap> } = {};

  swapping?: IItem;

  constructor(
    private readonly _dataService: DataService,
  ) {
    this.typeItems = {};
    for (const type in ItemType) { this.typeItems[type] = []; }

    _dataService.itemConfig.items.forEach(item => {
      let type = item.type;
      if (type === ItemType.Emote && (item.subtype === ItemSubtype.FriendEmote || item.level! > 1)) { return; }

      const node = item.nodes?.at(-1);
      if (node) {
        const spirit = node.root?.spiritTree?.spirit;
        (item as any)._subIcon ||= spirit?.season?.iconUrl;
        (item as any)._label ||= spirit?.events?.at(-1)?.eventInstance?.event?.shortName || spirit?.events?.at(-1)?.eventInstance?.event?.name;
      }

      const shop = item.iaps?.at(-1)?.shop || item.listNodes?.at(-1)?.itemList?.shop;
      if (shop) {
        (item as any)._subIcon ||= shop.season?.iconUrl;
        (item as any)._label ||= shop.event?.event?.shortName || shop.event?.event?.name;
      }

      (item as any)._label = (item as any)._label?.substring(0, 5);

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

    const swaps: Array<ISwap> = [];
    this.typeSwaps[type] = swaps;

    items.forEach((item, i) => {
      item.order = (item as any)._initialOrder;
      const itemOrder = item.order || 99999;
      const prev = items[i - 1];
      const prevOrder = prev?.order ?? -1;
      const nextOrder = items[i + 1]?.order ?? 99999;

      if (itemOrder < nextOrder && itemOrder > prevOrder) { return; }

      if (prevOrder >= itemOrder) {
        item.order = prevOrder + (Math.abs(nextOrder - itemOrder) > 10 ? 10 : 1);
        swaps.push({ item, prev, old: itemOrder, new: item.order });
      }
    });
  }

  copyText(evt: Event): void {
    const target = evt.currentTarget as HTMLElement;
    const text = target.innerText;
    navigator.clipboard.writeText(text || '');
  }
}
