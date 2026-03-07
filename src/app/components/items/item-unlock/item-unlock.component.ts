import { ChangeDetectionStrategy, Component, HostListener, Signal, signal } from '@angular/core';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { IItem, ItemType, INode, IIAP, IItemListNode } from 'skygame-data';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CanDeactivateFn, RouterLink } from "@angular/router";
import { ItemTypeSelectorComponent } from '../item-type-selector/item-type-selector.component';
import { ItemTypePipe } from "../../../pipes/item-type.pipe";

export const canDeactivateItemUnlock: CanDeactivateFn<ItemUnlockComponent> = () => {
  return confirm('Are you sure you want to leave Quick Start without applying any changes?');
};

@Component({
    selector: 'app-item-unlock',
    templateUrl: './item-unlock.component.html',
    styleUrls: ['./item-unlock.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, ItemIconComponent, RouterLink, ItemTypeSelectorComponent, ItemTypePipe]
})
export class ItemUnlockComponent {
  inputColumns = new FormControl(6);
  inputSeason = new FormControl('');
  columns = toSignal(this.inputColumns.valueChanges, { initialValue: this.inputColumns.value });

  step = signal(1);
  firstSeason = signal<string>('');

  items = signal<Array<IItem>>([]);
  itemType = signal<ItemType>(ItemType.Outfit);
  itemTypes = [
    ItemType.Outfit,
    ItemType.Shoes,
    ItemType.OutfitShoes,
    ItemType.Mask,
    ItemType.FaceAccessory,
    ItemType.Necklace,
    ItemType.Hair,
    ItemType.HairAccessory,
    ItemType.HeadAccessory,
    ItemType.Cape,
    ItemType.Held,
    ItemType.Furniture,
    ItemType.Prop,
    ItemType.Emote,
    ItemType.Stance,
    ItemType.Call
  ];

  unlocked: { [guid: string]: IItem } = {};
  visible: { [guid: string]: IItem } = {};
  previewItems = signal<Array<IItem>>([]);

  musicItems = ItemHelper.sortItems(this._dataService.itemConfig.items.filter(i => i.type === ItemType.Music));
  musicUnlocked: { [guid: string]: IItem } = {};

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    this.saveCache();
    event.preventDefault();
  }


  private _itemCache = new Map<ItemType, Array<IItem>>();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService
  ) {
    this.setItemType(ItemType.Outfit);
    this.previewItems.set(this.items().slice(0, 20));
    this.loadCache();
  }

  markAllLocked(): void {
    if (!confirm(`Are you sure you want to remove all items in this closet?`)) { return; }
    this.items().forEach(item => {
      delete this.unlocked[item.guid];
      delete this.visible[item.guid];
    });
  }

  markAllUnlocked(): void {
    if (!confirm(`Are you sure you want to unlock all items in this closet?`)) { return; }
    this.items().forEach(item => {
      this.unlocked[item.guid] = item;
      delete this.visible[item.guid];
    });
  }

  markAllMusicLocked(): void {
    if (!confirm(`Are you sure you want to remove all music sheets?`)) { return; }
    this.musicItems.forEach(item => {
      delete this.musicUnlocked[item.guid];
    });
  }

  markAllMusicUnlocked(): void {
    if (!confirm(`Are you sure you want to unlock all music sheets?`)) { return; }
    this.musicItems.forEach(item => {
      this.musicUnlocked[item.guid] = item;
    });
  }

  toggleItem(item: IItem, event: MouseEvent): void {
    if (event.shiftKey) {
      this.visible[item.guid] = item;
      delete this.unlocked[item.guid];
    } else if (this.visible[item.guid]) {
      delete this.visible[item.guid];
      this.unlocked[item.guid] = item;
    } else if (this.unlocked[item.guid]) {
      delete this.unlocked[item.guid];
    } else {
      this.unlocked[item.guid] = item;
    }
  }

  toggleMusic(item: IItem): void {
    if (this.musicUnlocked[item.guid]) {
      delete this.musicUnlocked[item.guid];
    } else {
      this.musicUnlocked[item.guid] = item;
    }
  }

  previousStep(): void {
    switch (this.step()) {
      case 2: return this.setStep(1);
      case 3: return this.setStep(2);
    }
  }

  nextStep(): void {
    switch (this.step()) {
      case 1: return this.setStep(2);
      case 2:
        if (!confirm('Have you finished all of your closets?')) { return; }
        return this.setStep(3);
    }
  }

  private setStep(step: number): void {
    this.step.set(step);
    this.scrollTop();
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  setItemType(type: ItemType): void {
    if (this._itemCache.has(type)) {
      this.items.set(this._itemCache.get(type)!);
      this.itemType.set(type);
      return;
    }

    const items = this._dataService.itemConfig.items.filter(v => v.type === type);
    ItemHelper.sortItems(items);

    this._itemCache.set(type, items);
    this.items.set(items);
    this.itemType.set(type)
  }

  // #region Cache

  saveCache(): void {
    try {
      sessionStorage.setItem('item-unlock.unlocked', JSON.stringify(Object.keys(this.unlocked)));
      sessionStorage.setItem('item-unlock.visible', JSON.stringify(Object.keys(this.visible)));
    } catch { /**/ }
  }

  loadCache(): void {
    try {
      const cachedUnlocked = sessionStorage.getItem('item-unlock.unlocked') || '[]';
      const cachedVisible = sessionStorage.getItem('item-unlock.visible') || '[]';

      this.unlocked = {};
      JSON.parse(cachedUnlocked).forEach((guid: string) => {
        if (typeof guid !== 'string') { return; }
        const item = this._dataService.guidMap.get(guid) as IItem | undefined;
        if (item) { this.unlocked[guid] = item; }
      });

      this.visible = {};
      JSON.parse(cachedVisible).forEach((guid: string) => {
        if (typeof guid !== 'string') { return; }
        const item = this._dataService.guidMap.get(guid) as IItem | undefined;
        if (item) { this.visible[guid] = item; }
      });
    } catch { /**/ }
  }

  // #endregion

  // #region Unlocking

  unlockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to unlock all items in this group?`)) { return; }
    this.items().forEach(item => { this.unlockItem(item, true); });
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
    if (iap.bought || iap.gifted) { return; }

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

  lockAll(): void {
    if (!confirm(`Are you sure you want to remove all items in this group?`)) { return; }
    this.items().forEach(item => { this.lockItem(item, true); });
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
