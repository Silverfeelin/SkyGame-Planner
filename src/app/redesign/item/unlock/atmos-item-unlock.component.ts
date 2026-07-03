import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { MatIcon } from '@angular/material/icon';
import { IItem, IIAP, IItemListNode, INode, ItemType } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';

interface ITypeSection {
  type: ItemType;
  label: string;
  items: ReadonlyArray<IItem>;
}

const TYPE_LABELS: Partial<Record<ItemType, string>> = {
  Outfit: 'Outfits',
  Shoes: 'Shoes',
  OutfitShoes: 'Outfits with shoes',
  Mask: 'Masks',
  FaceAccessory: 'Face accessories',
  Necklace: 'Necklaces',
  Hair: 'Hair',
  HairAccessory: 'Hair accessories',
  HeadAccessory: 'Head accessories',
  Cape: 'Capes',
  Held: 'Held props',
  Furniture: 'Furniture',
  Prop: 'Props',
  Emote: 'Emotes',
  Stance: 'Stances',
  Call: 'Calls',
  Music: 'Music'
};

const SECTION_TYPES: ReadonlyArray<ItemType> = [
  ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
  ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
  ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
  ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop,
  ItemType.Emote, ItemType.Stance, ItemType.Call, ItemType.Music
];

@Component({
  selector: 'app-atmos-item-unlock',
  templateUrl: './atmos-item-unlock.component.html',
  styleUrl: './atmos-item-unlock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon, ItemIconComponent, AtmosItemQuickActionsComponent]
})
export class AtmosItemUnlockComponent {
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);

  readonly sections: ReadonlyArray<ITypeSection>;

  constructor() {
    this.sections = this.buildSections();
  }

  toggleItem(item: IItem, unlock?: boolean): void {
    unlock ??= !item.unlocked;
    unlock ? this.unlockItem(item, true) : this.lockItem(item, true);
  }

  unlockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to unlock all items in this group?`)) { return; }
    const section = this.sections.find(s => s.type === type);
    section?.items.forEach(item => this.unlockItem(item, true));
  }

  lockAll(type: ItemType): void {
    if (!confirm(`Are you sure you want to remove all items in this group?`)) { return; }
    const section = this.sections.find(s => s.type === type);
    section?.items.forEach(item => this.lockItem(item, true));
  }

  private buildSections(): ReadonlyArray<ITypeSection> {
    const typeItems: Record<string, Array<IItem>> = {};
    for (const type in ItemType) { typeItems[type] = []; }

    this._dataService.itemConfig.items.forEach(item => {
      typeItems[item.type].push(item);
    });

    for (const type in ItemType) {
      const items = typeItems[type];
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
        typeItems[type] = levels.flat();
      } else {
        ItemHelper.sortItems(items);
      }
    }

    return SECTION_TYPES.map(t => ({
      type: t,
      label: TYPE_LABELS[t] ?? t,
      items: typeItems[t] ?? []
    }));
  }

  private unlockItem(item: IItem, withRelated = false): void {
    if (item.unlocked) { return; }
    item.unlocked = true;
    this._storageService.addUnlocked(item.guid);
    if (withRelated) {
      if (item.nodes?.length) { this.unlockNode(item.nodes.at(-1)!); }
      else if (item.hiddenNodes?.length) { this.unlockNode(item.hiddenNodes.at(-1)!); }
      else if (item.iaps?.length) { this.unlockIAP(item.iaps.at(-1)!); }
      else if (item.listNodes?.length) { this.unlockListNode(item.listNodes.at(-1)!); }
    }
  }

  private unlockNode(node: INode): void {
    if (node.unlocked) { return; }
    node.unlocked = true;
    this._storageService.addUnlocked(node.guid);
    if (node.item) { this.unlockItem(node.item, false); }
    node.hiddenItems?.forEach(v => this.unlockItem(v, false));
  }

  private unlockIAP(iap: IIAP): void {
    if (iap.bought || iap.gifted) { return; }
    iap.bought = true;
    this._storageService.addUnlocked(iap.guid);
    iap.items?.forEach(item => this.unlockItem(item, false));
  }

  private unlockListNode(node: IItemListNode): void {
    if (node.unlocked) { return; }
    node.unlocked = true;
    this._storageService.addUnlocked(node.guid);
    this.unlockItem(node.item, false);
  }

  private lockItem(item: IItem, withRelated = false): void {
    if (!item.unlocked) { return; }
    if (item.autoUnlocked) { return; }
    item.unlocked = false;
    this._storageService.removeUnlocked(item.guid);
    if (withRelated) {
      item.nodes?.forEach(node => this.lockNode(node));
      item.hiddenNodes?.forEach(node => this.lockNode(node));
      item.iaps?.forEach(iap => this.lockIAP(iap));
      item.listNodes?.forEach(node => this.lockListNode(node));
    }
    this._eventService.itemToggled.next(item);
  }

  private lockNode(node: INode): void {
    if (!node.unlocked) { return; }
    node.unlocked = false;
    this._storageService.removeUnlocked(node.guid);
    node.hiddenItems?.forEach(v => this.lockItem(v, false));
  }

  private lockIAP(iap: IIAP): void {
    if (!iap.bought) { return; }
    iap.bought = false;
    this._storageService.removeUnlocked(iap.guid);
    iap.items?.forEach(item => this.lockItem(item, false));
  }

  private lockListNode(node: IItemListNode): void {
    if (!node.unlocked) { return; }
    node.unlocked = false;
    this._storageService.removeUnlocked(node.guid);
    this.lockItem(node.item, false);
  }
}
