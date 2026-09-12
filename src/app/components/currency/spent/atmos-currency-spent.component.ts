import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { nanoid } from 'nanoid';
import { CostHelper } from '@app/helpers/cost-helper';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { INestingStorageData, nestingStorageKey } from '@app/redesign/shop/nesting/shop-nesting.interface';
import { ICost, INode, IItemListNode, IIAP, ISeason, IEvent, IEventInstance, IItem } from 'skygame-data';
import { AtmosCurrencyQuickActionsComponent } from '../quick-actions/atmos-currency-quick-actions.component';

interface IOtherCost {
  name: string;
  cost: ICost;
}

interface IInstanceCost {
  cost: ICost;
  price: number;
  nodes: Array<INode>;
  listNodes: Array<IItemListNode>;
  iaps: Array<IIAP>;
  others?: Array<IOtherCost>;
  breakdownVisible?: boolean;
}

interface IInstanceCostData {
  node?: INode;
  listNode?: IItemListNode;
  iap?: IIAP;
  other?: IOtherCost;
}

@Component({
  selector: 'app-atmos-currency-spent',
  templateUrl: './atmos-currency-spent.component.html',
  styleUrl: './atmos-currency-spent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TooltipDirective, NgTemplateOutlet, DecimalPipe, AtmosCurrencyQuickActionsComponent]
})
export class AtmosCurrencySpentComponent {
  readonly total: IInstanceCost = { cost: CostHelper.create(), price: 0, nodes: [], listNodes: [], iaps: [] };
  readonly regular: IInstanceCost = { cost: CostHelper.create(), price: 0, nodes: [], listNodes: [], iaps: [] };

  readonly seasonSet = new Set<ISeason>();
  readonly seasons: Array<ISeason> = [];
  readonly seasonUnlockedCost: { [key: string]: IInstanceCost } = {};

  readonly eventSet = new Set<IEvent>();
  readonly events: Array<IEvent> = [];
  readonly eventUnlockedCost: { [key: string]: IInstanceCost } = {};

  readonly eventInstanceSet = new Set<IEventInstance>();
  readonly eventInstancesByEvent: { [key: string]: Array<IEventInstance> } = {};
  readonly eventInstanceUnlockedCost: { [key: string]: IInstanceCost } = {};

  readonly seasonsFolded = signal(true);
  readonly eventsFolded = signal(true);

  nestingWorkshop?: INestingStorageData;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService
  ) {
    this.checkNodes();
    this.checkItemLists();
    this.checkIaps();
    this.checkSeasonPasses();
    this.checkNesting();

    // Filter and sort seasons.
    const filteredSeasons = this.seasons.filter(s => !CostHelper.isEmpty(this.seasonUnlockedCost[s.guid].cost) || this.seasonUnlockedCost[s.guid].price);
    this.seasons.length = 0;
    this.seasons.push(...filteredSeasons);
    this.seasons.sort((a, b) => a.number - b.number);

    this.events.sort((a, b) => (b.instances?.at(-1)?.date.toSeconds() ?? Number.MAX_VALUE) - (a.instances?.at(-1)?.date.toSeconds() ?? Number.MAX_VALUE));
    for (const eventInstances of Object.values(this.eventInstancesByEvent)) {
      eventInstances.sort((a, b) => b.number - a.number);
    }
  }

  toggleBreakdown(data: IInstanceCost): void {
    data.breakdownVisible = !data.breakdownVisible;
  }

  toggleSeasons(): void { this.seasonsFolded.update(v => !v); }
  toggleEvents(): void { this.eventsFolded.update(v => !v); }

  private checkNodes(): void {
    for (const node of this._dataService.nodeConfig.items) {
      if (!node.unlocked) { continue; }
      const tree = node.root?.tree;
      const eventInstance = tree?.eventInstanceSpirit?.eventInstance;
      const season = tree?.spirit?.season;

      if (eventInstance) {
        this.addEventInstanceCost(eventInstance, { node });
      } else if (season) {
        this.addSeasonCost(season, { node });
      } else {
        this.addInstanceCost(this.regular, { node });
      }

      this.addInstanceCost(this.total, { node });
    }
  }

  private checkItemLists(): void {
    for (const itemList of this._dataService.itemListConfig.items) {
      const season = itemList.shop?.season;
      const eventInstance = itemList.shop?.event;
      const event = eventInstance?.event;

      for (const listNode of itemList.items) {
        if (!listNode.unlocked) { continue; }

        if (season) {
          this.addSeasonCost(season, { listNode });
        } else if (event) {
          this.addEventInstanceCost(eventInstance, { listNode });
        } else {
          this.addInstanceCost(this.regular, { listNode });
        }

        this.addInstanceCost(this.total, { listNode });
      }
    }
  }

  private checkIaps(): void {
    for (const iap of this._dataService.iapConfig.items) {
      if (!iap.bought) { continue; }
      const season = iap.shop?.season;
      const eventInstance = iap.shop?.event;

      if (season) {
        this.addSeasonCost(season, { iap });
      } else if (eventInstance) {
        this.addEventInstanceCost(eventInstance, { iap });
      } else {
        this.addInstanceCost(this.regular, { iap });
      }

      this.addInstanceCost(this.total, { iap });
    }
  }

  private checkSeasonPasses(): void {
    for (const season of this._dataService.seasonConfig.items) {
      const isGifted = this._storageService.hasGifted(season.guid);
      const boughtPass = !isGifted && this._storageService.hasSeasonPass(season.guid);
      if (boughtPass) {
        const iap = { guid: nanoid(10), name: `Season Pass (${season.shortName})`, price: 9.99 };
        this.addSeasonCost(season, { iap });
        this.addInstanceCost(this.total, { iap });
      }
    }
  }

  private addSeasonCost(season: ISeason, data: IInstanceCostData): void {
    if (!this.seasonSet.has(season)) {
      this.seasons.push(season);
      this.seasonSet.add(season);
      this.seasonUnlockedCost[season.guid] = { cost: CostHelper.create(), price: 0, nodes: [], listNodes: [], iaps: [] };
    }

    const instanceCost = this.seasonUnlockedCost[season.guid];
    this.addInstanceCost(instanceCost, data);
  }

  private addEventInstanceCost(eventInstance: IEventInstance, data: IInstanceCostData): void {
    const event = eventInstance.event;

    if (!this.eventInstanceSet.has(eventInstance)) {
      this.eventInstanceSet.add(eventInstance);
      this.eventInstancesByEvent[event.guid] ??= [];
      this.eventInstancesByEvent[event.guid].push(eventInstance);
    }

    if (!this.eventInstanceUnlockedCost[eventInstance.guid]) {
      this.eventInstanceUnlockedCost[eventInstance.guid] = { cost: CostHelper.create(), price: 0, nodes: [], listNodes: [], iaps: [] };
    }

    if (!this.eventSet.has(event)) {
      this.events.push(event);
      this.eventSet.add(event);
      this.eventUnlockedCost[event.guid] = { cost: CostHelper.create(), price: 0, nodes: [], listNodes: [], iaps: [] };
    }

    const instanceCost = this.eventInstanceUnlockedCost[eventInstance.guid];
    this.addInstanceCost(instanceCost, data);
    const eventCost = this.eventUnlockedCost[event.guid];
    this.addInstanceCost(eventCost, data);
  }

  private addInstanceCost(instance: IInstanceCost, data: IInstanceCostData): void {
    if (data.node) {
      CostHelper.add(instance.cost, data.node);
      instance.nodes.push(data.node);
    }
    if (data.listNode) {
      CostHelper.add(instance.cost, data.listNode);
      instance.listNodes.push(data.listNode);
    }
    if (data.iap) {
      instance.price += data.iap.price || 0;
      instance.iaps.push(data.iap);
    }
    if (data.other) {
      instance.others ??= [];
      instance.others.push(data.other);
      CostHelper.add(instance.cost, data.other.cost);
    }
  }

  private checkNesting(): void {
    this.nestingWorkshop = this._storageService.getKey(nestingStorageKey) as INestingStorageData;
    if (!this.nestingWorkshop?.unlocked) { return; }
    for (const key of Object.keys(this.nestingWorkshop.unlocked)) {
      const item = this._dataService.guidMap.get(key) as IItem;
      if (!item) { continue; }
      const data = this.nestingWorkshop.unlocked[key];
      if (data?.cost && data.q) {
        this.addInstanceCost(this.regular, { other: { name: `Workshop - ${item.name} (x${data.q})`, cost: data.cost } });
        this.addInstanceCost(this.total, { other: { name: `Workshop - ${item.name} (x${data.q})`, cost: data.cost } });
      }
    }
  }
}
