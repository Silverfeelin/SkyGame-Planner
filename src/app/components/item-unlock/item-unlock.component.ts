import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-item-unlock',
  templateUrl: './item-unlock.component.html',
  styleUrls: ['./item-unlock.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    this._storageService.save();
  }

  private initializeItems(): void {
    this.typeItems = {};
    for (const type in ItemType) { this.typeItems[type] = []; }

    this._dataService.itemConfig.items.forEach(item => {
      let type = item.type;
      if (type === ItemType.Instrument) { type = ItemType.Held; }
      this.typeItems[type].push(item);
    });
  }

  // #region Unlocking

  unlockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to unlock all items in this group?`)) { return; }
    this.typeItems[type].forEach(item => { this.unlockItem(item, true); });
    this._storageService.save();
  }

  private unlockItem(item: IItem, withRelated = false): void {
    if (item.unlocked) { return; }

    // Unlock item.
    item.unlocked = true;
    this._storageService.add(item.guid);

    // Unlock related.
    if (withRelated) {
      if (item.nodes?.length) { this.unlockNode(item.nodes.at(-1)!); }
      else if (item.hiddenNodes?.length) { this.unlockNode(item.hiddenNodes.at(-1)!); }
      else if (item.iaps?.length) { this.unlockIAP(item.iaps.at(-1)!); }
    }
  }

  private unlockNode(node: INode): void {
    if (node.unlocked) { return; }

    // Unlock node.
    node.unlocked = true;
    this._storageService.add(node.guid);

    // Unlock related items.
    if (node.item) { this.unlockItem(node.item, false); }
    node.hiddenItems?.forEach(v => this.unlockItem(v, false));
  }

  private unlockIAP(iap: IIAP): void {
    if (iap.bought) { return; }

    // Unlock IAP.
    iap.bought = true;
    this._storageService.add(iap.guid);

    // Unlock related items.
    iap.items?.forEach(item => { this.unlockItem(item, false); });
  }

  // #endregion

  // #region Locking

  lockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to remove all items in this group?`)) { return; }
    this.typeItems[type].forEach(item => { this.lockItem(item, true); });
    this._storageService.save();
  }

  private lockItem(item: IItem, withRelated = false): void {
    if (!item.unlocked) { return; }
    if (item.autoUnlocked) { return; }

    // Lock item.
    item.unlocked = false;
    this._storageService.remove(item.guid);

    // Lock related.
    if (withRelated) {
      // Lock related nodes.
      item.nodes?.forEach(node => { this.lockNode(node); });
      item.hiddenNodes?.forEach(node => { this.lockNode(node); });

      // Lock related IAPs.
      item.iaps?.forEach(iap => { this.lockIAP(iap); });
    }

    this._eventService.itemToggled.next(item);
  }

  private lockNode(node: INode): void {
    if (!node.unlocked) { return; }

    // Lock node.
    node.unlocked = false;
    this._storageService.remove(node.guid);

    // Lock related items.
    node.hiddenItems?.forEach(v => this.lockItem(v, false));
  }

  private lockIAP(iap: IIAP): void {
    if (!iap.bought) { return; }

    // Lock IAP.
    iap.bought = false;
    this._storageService.remove(iap.guid);

    // Lock related items.
    iap.items?.forEach(item => { this.lockItem(item, false); });
  }

  // #endregion
}
