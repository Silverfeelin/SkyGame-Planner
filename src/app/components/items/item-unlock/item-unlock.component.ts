import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IItemListNode } from 'src/app/interfaces/item-list.interface';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgTemplateOutlet, NgFor } from '@angular/common';

@Component({
    selector: 'app-item-unlock',
    templateUrl: './item-unlock.component.html',
    styleUrls: ['./item-unlock.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgTemplateOutlet, NgFor, NgbTooltip, ItemIconComponent]
})
export class ItemUnlockComponent {
  typeItems: { [key: string]: Array<IItem> } = {};

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService
  ) {
    this.initializeItems();
  }

  toggleItem(item: IItem, unlock?: boolean): void {
    unlock ??= !item.unlocked;
    unlock ? this.unlockItem(item, true) : this.lockItem(item, true);
  }

  private initializeItems(): void {
    this.typeItems = {};
    for (const type in ItemType) { this.typeItems[type] = []; }

    this._dataService.itemConfig.items.forEach(item => {
      let type = item.type;
      this.typeItems[type].push(item);
    });

    for (const type in ItemType) {
      const items = this.typeItems[type];
      if (type === ItemType.Emote) {
        const levelMap = new Map<string, Array<IItem>>();
        const levels = items.filter(v => v.level === 1).sort(ItemHelper.sorter).map(v => {
          const arr = [v];
          levelMap.set(v.name, arr);
          return arr;
        });
        items.forEach(item => {
          if (item.level === 1) { return; }
          levelMap.get(item.name)?.push(item);
        });

        this.typeItems[type] = levels.flat();
      } else {
        ItemHelper.sortItems(items);
      }
    }
  }

  // #region Unlocking

  unlockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to unlock all items in this group?`)) { return; }
    this.typeItems[type].forEach(item => { this.unlockItem(item, true); });
  }

  private unlockItem(item: IItem, withRelated = false): void {
    if (item.unlocked) { return; }

    // Unlock item.
    item.unlocked = true;
    this._storageService.addUnlocked(item.guid);

    // Unlock related.
    if (withRelated) {
      if (item.nodes?.length) { this.unlockNode(item.nodes.at(-1)!); }
      else if (item.hiddenNodes?.length) { this.unlockNode(item.hiddenNodes.at(-1)!); }
      else if (item.iaps?.length) { this.unlockIAP(item.iaps.at(-1)!); }
      else if (item.listNodes?.length) { this.unlockListNode(item.listNodes.at(-1)!); }
    }
  }

  private unlockNode(node: INode): void {
    if (node.unlocked) { return; }

    // Unlock node.
    node.unlocked = true;
    this._storageService.addUnlocked(node.guid);

    // Unlock related items.
    if (node.item) { this.unlockItem(node.item, false); }
    node.hiddenItems?.forEach(v => this.unlockItem(v, false));
  }

  private unlockIAP(iap: IIAP): void {
    if (iap.bought) { return; }

    // Unlock IAP.
    iap.bought = true;
    this._storageService.addUnlocked(iap.guid);

    // Unlock related items.
    iap.items?.forEach(item => { this.unlockItem(item, false); });
  }

  private unlockListNode(node: IItemListNode): void {
    if (node.unlocked) { return; }

    // Unlock node.
    node.unlocked = true;
    this._storageService.addUnlocked(node.guid);

    // Unlock item.
    this.unlockItem(node.item, false);
  }

  // #endregion

  // #region Locking

  lockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to remove all items in this group?`)) { return; }
    this.typeItems[type].forEach(item => { this.lockItem(item, true); });
  }

  private lockItem(item: IItem, withRelated = false): void {
    if (!item.unlocked) { return; }
    if (item.autoUnlocked) { return; }

    // Lock item.
    item.unlocked = false;
    this._storageService.removeUnlocked(item.guid);

    // Lock related.
    if (withRelated) {
      // Lock related nodes.
      item.nodes?.forEach(node => { this.lockNode(node); });
      item.hiddenNodes?.forEach(node => { this.lockNode(node); });

      // Lock related Shops.
      item.iaps?.forEach(iap => { this.lockIAP(iap); });
      item.listNodes?.forEach(node => { this.lockListNode(node); });
    }

    this._eventService.itemToggled.next(item);
  }

  private lockNode(node: INode): void {
    if (!node.unlocked) { return; }

    // Lock node.
    node.unlocked = false;
    this._storageService.removeUnlocked(node.guid);

    // Lock related items.
    node.hiddenItems?.forEach(v => this.lockItem(v, false));
  }

  private lockIAP(iap: IIAP): void {
    if (!iap.bought) { return; }

    // Lock IAP.
    iap.bought = false;
    this._storageService.removeUnlocked(iap.guid);

    // Lock related items.
    iap.items?.forEach(item => { this.lockItem(item, false); });
  }

  private lockListNode(node: IItemListNode): void {
    if (!node.unlocked) { return; }

    // Lock node.
    node.unlocked = false;
    this._storageService.removeUnlocked(node.guid);

    // Lock item.
    this.lockItem(node.item, false);
  }

  // #endregion
}
