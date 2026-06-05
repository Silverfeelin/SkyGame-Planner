import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import {
  ICost,
  IItem,
  IItemList,
  IItemListNode,
  ISpirit,
  ISpiritTree
} from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import {
  AtmosItemListComponent,
  AtmosItemListNodeClickEvent,
  AtmosSpiritTreeComponent
} from '@app/redesign/shared/atmos-shared-widgets';
import {
  INestingStorageData,
  nestingStorageKey
} from '@app/components/shops/shop-nesting/shop-nesting.interface';

interface IRotationItem extends ICost {
  guid: string;
  item?: IItem;
  expectedDate?: DateTime;
}

type IRotation = Array<IRotationItem>;
type IRotations = Array<IRotation>;

const permanentItems: IRotation = [
  { guid: 'pk88jDrFaq', c: 8 },
  { guid: 'kjqZOiZkv8', h: 10 },
  { guid: 'rtZSEy-6Rz', c: 10 },
  { guid: 't3D6CbSY-E', c: 10 },
  { guid: 'pJ_qec46o4', h: 24 },
  { guid: 'UhsOYAJONq', c: 23 },
  { guid: 'yFLIo5YGNu', ac: 33 }
];

const rotations: IRotations = [
  [
    { guid: 'm1jq0R3vip', ac: 35 },
    { guid: 'g0FAk-lWFi', c: 11 }
  ],
  [
    { guid: '9ZDdv0TG9w', c: 16 },
    { guid: 'ch-1pp8DuT', c: 20 },
    { guid: 'i1RW5NFFGc', c: 8 },
    { guid: 'EQwb6KLMv5', ac: 15 }
  ],
  [
    { guid: 'QLPTcl6MON', c: 60 },
    { guid: 'whT_cZQrv5', c: 50 },
    { guid: 'raTbmXIzTD', c: 12 },
    { guid: 'uOQmeCxRGG', c: 12 }
  ],
  [
    { guid: 'rMl2rj9Qgv', c: 45 },
    { guid: '9HXJ6pJTXa', c: 10 },
    { guid: 'y1UR_gd2PM', c: 18 }
  ],
  [
    { guid: '2If2D4W1DF', h: 33 },
    { guid: 'wbzLOXS8C_', h: 18 },
    { guid: '2d5HB466-h', h: 12 },
    { guid: 'v1NMHHJO7Q', h: 8 }
  ],
  [
    { guid: 'R7mNhWclrv', c: 25 },
    { guid: 'AZv6JDJqdb', h: 23 },
    { guid: 'dJD-OBSWgc', ac: 8 }
  ],
  [
    { guid: 'PABCJmm2HT', c: 20 },
    { guid: '3tQqaibcJk', h: 33 },
    { guid: '-YUvzkL_uS', h: 25 },
    { guid: 'RK22qlqiJ5', c: 40 }
  ],
  [
    { guid: 'gbOCxa6g06', c: 25 },
    { guid: '0o0Nvnd4gf', ac: 28 },
    { guid: '8wRmxxKS7h', ac: 16 },
    { guid: '_xcJueC0Rj', c: 50 }
  ],
  [
    { guid: 'dYVs7we_4Q', c: 25 },
    { guid: 'x7ZD_lIDh_', c: 10 },
    { guid: 'snZQpzP822', c: 40 },
    { guid: 'W0x496lay7', h: 18 }
  ],
  [
    { guid: 'kjqZOiZkv8', h: 10 },
    { guid: 'nZmPXeJKoF', c: 10 },
    { guid: '7pVaQBiTSo', c: 30 },
    { guid: 'fjJHoEZUoq', h: 20 }
  ],
  [
    { guid: 'oa5rIbuWkA', c: 20 },
    { guid: 'TaOpfMm1Z1', c: 15 },
    { guid: '_igBIcu6Pg', c: 70 }
  ],
  [
    { guid: 'PRSX9s-tGz', c: 40 },
    { guid: 'srZq8IciYN', c: 80 }
  ],
  [
    { guid: '-_R3fzw7MF', ac: 25 },
    { guid: 'FpXfl3Dpff', h: 45 },
    { guid: 'cqPAxA0gAc', c: 90 }
  ],
  [
    { guid: 'Kuo5r3BpFu', ac: 6 }
  ]
];

@Component({
  selector: 'app-atmos-shop-nesting',
  templateUrl: './atmos-shop-nesting.component.html',
  styleUrl: './atmos-shop-nesting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIcon,
    NgTemplateOutlet,
    CostComponent,
    DateComponent,
    ItemIconComponent,
    AtmosItemListComponent,
    AtmosSpiritTreeComponent
  ]
})
export class AtmosShopNestingComponent {
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);

  readonly challengeSpirits: ReadonlyArray<{ spirit: ISpirit; tree: ISpiritTree }>;
  readonly workshopItemList: IItemList;
  readonly permanentRotation = permanentItems;
  readonly rotations = rotations;

  readonly iRotation: number;
  readonly itemLists: ReadonlyArray<IItemList>;
  readonly legacyFreeItemList: IItemList;
  readonly legacyCorrectionItemList: IItemList;

  readonly highlightNode = signal<string | undefined>(undefined);
  readonly data = signal<INestingStorageData>({ unlocked: {} });

  private readonly _rotationItemCostMap: { [guid: string]: ICost } = {};
  private readonly _workshopItemNodeMap: { [guid: string]: IItemListNode } = {};
  private readonly _workshopNodeMap: { [guid: string]: IItemListNode } = {};

  constructor(route: ActivatedRoute) {
    this.initializeRotations();

    this.challengeSpirits = ['os6ryCdFZ5', 'Gp-hW_NCv_', 'IhAh5oTvF8'].map(g => {
      const spirit = this._dataService.guidMap.get(g) as ISpirit;
      return { spirit, tree: spirit.treeRevisions?.at(-1) || spirit.tree! };
    });

    this.workshopItemList = this._dataService.guidMap.get('AKNI67tVW-') as IItemList;
    for (const node of this.workshopItemList.items) {
      this._workshopItemNodeMap[node.item.guid] = node;
      this._workshopNodeMap[node.guid] = node;
    }

    const start = DateTime.fromISO('2024-04-15');
    const today = DateTime.now().startOf('week');
    const weeksBetween = Math.ceil(today.diff(start, 'weeks').weeks);
    this.iRotation = weeksBetween % rotations.length;

    this.itemLists = rotations.map<IItemList>((r, i) => ({
      guid: nanoid(10),
      items: r.map(j => this._workshopItemNodeMap[j.guid]),
      title: `Rotation ${i + 1}`
    }));

    this.legacyFreeItemList = {
      guid: nanoid(10),
      items: ['_qe1M1aTek'].map(g => this._workshopNodeMap[g])
    };
    this.legacyCorrectionItemList = {
      guid: nanoid(10),
      items: ['M-n46rmsiI', '521NL_oVIS'].map(g => this._workshopNodeMap[g])
    };

    this.loadData();

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    // Mirror legacy behaviour: track unlocked legacy quantity.
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(item => {
      const listNode = item.listNodes?.find(n => n.unlocked);
      const next = { ...this.data() };
      next.unlocked = { ...next.unlocked };
      next.unlocked[item.guid] = { ...(next.unlocked[item.guid] ?? { q: 0 }) };
      next.unlocked[item.guid]!.lq = item.unlocked ? listNode?.quantity : 0;
      this.data.set(next);
    });
  }

  addQuantity(itemGuid: string, quantity: number): void {
    const item = this._dataService.guidMap.get(itemGuid) as IItem;
    if (!item) { alert('Item not found, please report this!'); return; }

    const next = { ...this.data() };
    next.unlocked = { ...next.unlocked };
    next.unlocked[itemGuid] = { ...(next.unlocked[itemGuid] ?? { q: 0 }) };
    const entry = next.unlocked[itemGuid]!;
    entry.q = Math.max(0, (entry.q || 0) + quantity);

    if (!entry.q && !entry.lq) {
      delete next.unlocked[itemGuid];
      item.unlocked = false;
      this._storageService.removeUnlocked(itemGuid);
      this._eventService.itemToggled.next(item);
    } else {
      entry.cost = CostHelper.multiply(CostHelper.clone(this._rotationItemCostMap[itemGuid]), entry.q ?? 0);
      if (!item.unlocked) {
        item.unlocked = true;
        this._storageService.addUnlocked(itemGuid);
        this._eventService.itemToggled.next(item);
      }
    }

    this.data.set(next);
    this.saveData(next);
  }

  unlockedFor(guid: string) {
    return this.data().unlocked[guid];
  }

  onBeforeLegacy(evt: AtmosItemListNodeClickEvent): void {
    const item = evt.node.item;
    if (!item || !this.data().unlocked[item.guid]?.q) { return; }
    alert(`You've already unlocked this prop in the above section. Please remove it before changing the legacy section.`);
    evt.prevent();
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightNode.set(p.get('highlightNode') || undefined);
  }

  private initializeRotations(): void {
    const currentWeek = DateHelper.todaySky().startOf('week');
    const date = DateTime.fromISO('2024-04-15T12:00:00').setZone(DateHelper.skyTimeZone).startOf('week');

    const weeksBetween = Math.ceil(currentWeek.diff(date, 'weeks').weeks);
    const iDate = weeksBetween % rotations.length;

    for (const [rotationIndex, rotation] of rotations.entries()) {
      let iNext = rotationIndex;
      if (iNext < iDate) { iNext += rotations.length; }
      rotation.forEach(r => {
        r.item = this._dataService.guidMap.get(r.guid) as IItem;
        this._rotationItemCostMap[r.item.guid] = r;
        // expectedDate intentionally unset — see legacy comment about issue #265.
      });
    }

    for (const r of permanentItems) {
      r.item = this._dataService.guidMap.get(r.guid) as IItem;
      this._rotationItemCostMap[r.item.guid] = r;
    }
  }

  private loadData(): void {
    const stored = this._storageService.getKey<INestingStorageData>(nestingStorageKey) || { unlocked: {} };
    for (const key of Object.keys(stored.unlocked)) {
      const value = stored.unlocked[key];
      if (!value) { continue; }
      value.cost = CostHelper.multiply(CostHelper.clone(this._rotationItemCostMap[key] || {}), value.q ?? 1);
    }

    for (const key of Object.keys(this._rotationItemCostMap)) {
      const item = this._dataService.guidMap.get(key) as IItem;
      if (!item) { continue; }
      const unlockedListNode = item.listNodes?.find(n => n.unlocked);
      if (unlockedListNode?.quantity) {
        stored.unlocked[key] ??= { q: 0 };
        stored.unlocked[key]!.lq = unlockedListNode.quantity;
      }
    }

    this.data.set(stored);
  }

  private saveData(state: INestingStorageData): void {
    const data: INestingStorageData = { unlocked: {} };
    for (const key of Object.keys(state.unlocked)) {
      const value = state.unlocked[key];
      if (!value || !value.q) { continue; }
      data.unlocked[key] = { q: value.q, cost: value.cost };
    }
    this._storageService.setKey(nestingStorageKey, data);
  }
}
