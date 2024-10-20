import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ISpirit } from '@app/interfaces/spirit.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent } from "../../layout/card/card.component";
import { SpiritTreeComponent } from "../../spirit-tree/spirit-tree.component";
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { ItemListComponent } from "../../item-list/item-list/item-list.component";
import { ParamMap } from '@angular/router';
import { IItemList, IItemListNode } from '@app/interfaces/item-list.interface';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import { CostHelper } from '@app/helpers/cost-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { StorageService } from '@app/services/storage.service';
import { DateComponent } from "../../util/date/date.component";
import { ItemIconComponent } from "../../items/item-icon/item-icon.component";
import { IItem } from '@app/interfaces/item.interface';
import { ItemListNodeClickEvent } from '@app/components/item-list/item-list-node/item-list-node.component';
import { EventService } from '@app/services/event.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { INestingStorageData, nestingStorageKey } from './shop-nesting.interface';

interface IRotationItem extends ICost {
  /** Item guid */
  guid: string;
  item?: IItem;
}

interface IRotation extends Array<IRotationItem> {}
interface IRotations extends Array<IRotation> {}

// Nesting workshop rotations.
const rotations: IRotations = [
  [
    { guid: 'pk88jDrFaq', c: 8 },
    { guid: 'm1jq0R3vip', ac: 35 },
    { guid: 'g0FAk-lWFi', c: 11 },
    { guid: 'pJ_qec46o4', h: 24 },
  ],
  [
    { guid: '9ZDdv0TG9w', c: 16 },
    { guid: 'ch-1pp8DuT', c: 20 },
    { guid: 'i1RW5NFFGc', c: 8 },
    { guid: 'EQwb6KLMv5', ac: 15 },
  ],
  [
    { guid: 'QLPTcl6MON', c: 60 },
    { guid: 'whT_cZQrv5', c: 50 },
    { guid: 'raTbmXIzTD', c: 12 },
    { guid: 'uOQmeCxRGG', c: 12 },
  ],
  [
    { guid: 'kjqZOiZkv8', h: 10 },
    { guid: 'rMl2rj9Qgv', c: 45 },
    { guid: 'y1UR_gd2PM', c: 17 },
    { guid: '9HXJ6pJTXa', c: 10 },
  ],
  [
    { guid: '2If2D4W1DF', h: 33 },
    { guid: 'wbzLOXS8C_', h: 18 },
    { guid: '2d5HB466-h', h: 12 },
    { guid: 'v1NMHHJO7Q', h: 7 },
  ],
  [
    { guid: 'R7mNhWclrv', c: 25 },
    { guid: 'AZv6JDJqdb', h: 23 },
    { guid: 'dJD-OBSWgc', ac: 8 },
    { guid: 'UhsOYAJONq', c: 22 },
  ],
  [
    { guid: 'PABCJmm2HT', c: 20 },
    { guid: '3tQqaibcJk', h: 33 },
    { guid: '-YUvzkL_uS', h: 25 },
    { guid: 'RK22qlqiJ5', c: 40 },
  ],
  [
    { guid: 'gbOCxa6g06', c: 25 },
    { guid: '0o0Nvnd4gf', ac: 28 },
    { guid: '8wRmxxKS7h', ac: 16 },
    { guid: '_xcJueC0Rj', c: 50 },
  ],
  [
    { guid: 'dYVs7we_4Q', c: 25 },
    { guid: 'x7ZD_lIDh_', c: 10 },
    { guid: 'snZQpzP822', c: 40 },
    { guid: 'W0x496lay7', h: 18 },
  ],
  [
    { guid: 'kjqZOiZkv8', h: 10 },
    { guid: 'nZmPXeJKoF', c: 10 },
    { guid: '7pVaQBiTSo', c: 30 },
    { guid: 'fjJHoEZUoq', h: 20 },
  ],
  [
    { guid: 'oa5rIbuWkA', c: 20 },
    { guid: 'TaOpfMm1Z1', c: 15 },
    { guid: '_igBIcu6Pg', c: 70 },
  ],
  [
    { guid: 'PRSX9s-tGz', c: 20 },
    { guid: 'rtZSEy-6Rz', c: 10 },
    { guid: 'srZq8IciYN', c: 80 },
  ],
  [
    { guid: '-_R3fzw7MF', ac: 25 },
    { guid: 't3D6CbSY-E', c: 10 },
    { guid: 'FpXfl3Dpff', h: 45 },
    { guid: 'cqPAxA0gAc', c: 90 },
  ]
];

@Component({
  selector: 'app-shop-nesting',
  standalone: true,
  imports: [CardComponent, SpiritTreeComponent, WikiLinkComponent, ItemListComponent, CostComponent, DateComponent, ItemIconComponent],
  templateUrl: './shop-nesting.component.html',
  styleUrl: './shop-nesting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopNestingComponent {
  challengeSpirits: Array<ISpirit>;
  workshopItemList: IItemList;

  highlightNode?: string;

  data!: INestingStorageData;
  rotations = rotations;
  iRotation = 0;
  rotation?: IRotation;
  rotationItemCostMap: { [guid: string]: ICost } = {};

  itemLists: Array<IItemList> = [];
  legacyFreeItemList!: IItemList;
  legacyCorrectionItemList!: IItemList;

  workshopNodeMap: { [guid: string]: IItemListNode } = {};
  workshopItemNodeMap: { [guid: string]: IItemListNode } = {};

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initializeRotations();
    this.challengeSpirits = [ 'os6ryCdFZ5', 'Gp-hW_NCv_', 'IhAh5oTvF8' ].map(g => this._dataService.guidMap.get(g)!) as Array<ISpirit>;
    this.workshopItemList = _dataService.guidMap.get('AKNI67tVW-') as IItemList;
    this.initializeWorkshop();
    this.loadData();

    // Unlocking is blocked by onBeforeLegacy.
    _eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(item => {
      const listNode = item.listNodes?.find(n => n.unlocked);
      this.data.unlocked[item.guid] ??= { q: 0 };
      this.data.unlocked[item.guid]!.lq = item.unlocked ? listNode?.quantity : 0;
      _changeDetectorRef.markForCheck();
    });
  }

  addQuantity(itemGuid: string, quantity: number): void {
    const item = this._dataService.guidMap.get(itemGuid) as IItem;
    if (!item) { alert('Item not found, please report this!'); return; }

    this.data.unlocked[itemGuid] ??= { q: 0 };
    const data = this.data.unlocked[itemGuid]!;
    data.q = Math.max(0, (data.q || 0) + quantity);


    if (!data.q && !data.lq) {
      delete this.data.unlocked[itemGuid];
      item.unlocked = false;
      this._storageService.removeUnlocked(itemGuid);
      this._eventService.itemToggled.next(item);
    } else {
      data.cost = CostHelper.multiply(CostHelper.clone(this.rotationItemCostMap[itemGuid]), data.q ?? 0);
      if (!item.unlocked) {
        item.unlocked = true;
        this._storageService.addUnlocked(itemGuid);
        this._eventService.itemToggled.next(item);
      }
    }
    this.saveData();
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  onBeforeLegacy(evt: ItemListNodeClickEvent) {
    const item = evt.node.item;
    if (!item || !this.data.unlocked[item.guid]?.q) { return; }
    alert(`You've already unlocked this prop in the above section. Please remove it before changing the legacy section.`)
    evt.prevent();
  }

  private initializeRotations(): void {
    for (const rotation of rotations) {
      for (const r of rotation) {
        r.item = this._dataService.guidMap.get(r.guid) as IItem;
        this.rotationItemCostMap[r.item.guid] = r;
      }
    }
  }

  private initializeWorkshop(): void {
    this.workshopItemNodeMap = {};
    this.workshopNodeMap = {};
    for (const node of this.workshopItemList!.items) {
      this.workshopItemNodeMap[node.item.guid] = node;
      this.workshopNodeMap[node.guid] = node;
    }

    // Calculate rotation based on the week number since rotation 1.
    const start = DateTime.fromISO('2024-04-15');
    const today = DateTime.now().startOf('week');
    const weeksBetween = Math.ceil(today.diff(start, 'weeks').weeks);
    this.iRotation = weeksBetween % rotations.length;
    this.rotation = rotations[this.iRotation];

    this.itemLists = rotations.map<IItemList>((r, i) => ({
      guid: nanoid(10),
      items:  r.map(j => this.workshopItemNodeMap[j.guid]),
      title: `Rotation ${i + 1}`
    }));

    // Add a list for items that are or were temporarily free.
    const freeNodes = [ '_qe1M1aTek' ].map(g => this.workshopNodeMap[g]);
    this.legacyFreeItemList = {
      guid: nanoid(10),
      items: freeNodes
    };

    const correctionNodes = [ 'M-n46rmsiI', '521NL_oVIS' ].map(g => this.workshopNodeMap[g]);
    this.legacyCorrectionItemList = {
      guid: nanoid(10),
      items: correctionNodes
    };
  }

  private loadData(): void {
    this.data = this._storageService.getKey<INestingStorageData>(nestingStorageKey) || { unlocked: {}};
    for (const key of Object.keys(this.data.unlocked)) {
      const value = this.data.unlocked[key];
      if (!value) { continue; }
      value.cost = CostHelper.multiply(CostHelper.clone(this.rotationItemCostMap[key] || {}), value.q ?? 1);
    }

    for (const key of Object.keys(this.rotationItemCostMap)) {
      const item = this._dataService.guidMap.get(key) as IItem;
      if (!item) { continue; }
      const unlockedListNode = item.listNodes?.find(n => n.unlocked);
      if (unlockedListNode?.quantity) {
        this.data.unlocked[key] ??= { q: 0 };
        this.data.unlocked[key]!.lq = unlockedListNode.quantity;
      }
    }
  }

  private saveData(): void {
    const data: INestingStorageData = { unlocked: {} };
    for (const key of Object.keys(this.data.unlocked)) {
      const value = this.data.unlocked[key];
      if (!value || !value.q) { continue; }
      data.unlocked[key] = { q: value.q, cost: value.cost };
    }

    this._storageService.setKey(nestingStorageKey, data);
  }
}
