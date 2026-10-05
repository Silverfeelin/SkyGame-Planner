import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICost, IEventInstance, IIAP, IItem, IItemListNode, INode, ISeason, IShop, ISpecialVisit, ISpiritTree, ITravelingSpirit } from 'skygame-data';
import { CostHelper } from '@app/helpers/cost-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';

/** One favourited item that is obtainable during an ongoing occasion. */
interface IFavouriteRow {
  item: IItem;
  target: INavigationTarget;
  /** Caption shown under the icon, e.g. "Season of Moments". */
  source: string;
}

/** Item guid -> where it can be picked up right now. */
interface ISourceBag {
  items: Map<string, IItem>;
  labels: Map<string, string>;
  nodes: Map<string, INode>;
  lists: Map<string, IItemListNode>;
  iaps: Map<string, IIAP>;
}

@Component({
  selector: 'app-dashboard-favourites',
  templateUrl: './favourites-card.component.html',
  styleUrl: './favourites-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, ItemIconComponent, CostComponent, TooltipDirective]
})
export class DashboardFavouritesComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _eventService = inject(EventService);

  readonly SUBICONS_ALL = SUBICONS_ALL;

  /** Ongoing occasions, passed down from the dashboard so nothing is recomputed twice. */
  readonly season = input<ISeason | undefined>(undefined);
  readonly eventInstances = input<ReadonlyArray<IEventInstance>>([]);
  readonly ts = input<ITravelingSpirit | undefined>(undefined);
  readonly rs = input<ISpecialVisit | undefined>(undefined);

  /** Bumped whenever an item is favourited or (un)locked, to re-run the computeds. */
  private readonly _revision = signal(0);

  /** Everything obtainable right now, keyed by item guid. */
  private readonly _available = computed<ISourceBag>(() => {
    const bag: ISourceBag = { items: new Map(), labels: new Map(), nodes: new Map(), lists: new Map(), iaps: new Map() };

    const season = this.season();
    if (season) {
      season.spirits?.forEach(sp => this.addTree(bag, sp.tree, season.name));
      season.shops?.forEach(shop => this.addShop(bag, shop, season.name));
    }

    this.eventInstances().forEach(instance => {
      const label = instance.name ?? instance.event.name;
      instance.spirits?.forEach(sp => this.addTree(bag, sp.tree, label));
      instance.shops?.forEach(shop => this.addShop(bag, shop, label));
    });

    const ts = this.ts();
    if (ts) { this.addTree(bag, ts.tree, ts.spirit?.name ?? 'Traveling Spirit'); }

    const rs = this.rs();
    if (rs) {
      const label = rs.name || 'Special Visit';
      rs.spirits.forEach(sp => this.addTree(bag, sp.tree, label));
    }

    return bag;
  });

  /** Favourited, not yet owned, and available during an ongoing occasion. */
  readonly rows = computed<ReadonlyArray<IFavouriteRow>>(() => {
    this._revision();
    const bag = this._available();
    const items = [...this._storageService.getFavourites()]
      .map(guid => this._dataService.guidMap.get(guid) as IItem | undefined)
      .filter((i): i is IItem => !!i && !!i.favourited && !i.unlocked && bag.items.has(i.guid));

    ItemHelper.sortItems(items);
    return items.map(item => ({
      item,
      // Not every source resolves to a page; the item detail page is always reachable.
      target: NavigationHelper.getItemSource(item) ?? NavigationHelper.getItemLink(item),
      source: bag.labels.get(item.guid) ?? ''
    }));
  });

  readonly isActive = computed(() => this.rows().length > 0);

  /** Candles/hearts/etc still owed for the favourites above. */
  readonly cost = computed<ICost>(() => {
    const bag = this._available();
    const total = CostHelper.create();
    const nodes = new Set<INode>();

    for (const row of this.rows()) {
      const listNode = bag.lists.get(row.item.guid);
      if (listNode) { CostHelper.add(total, listNode); }
      const node = bag.nodes.get(row.item.guid);
      if (node) { nodes.add(node); }
    }

    // Prerequisite nodes have to be paid for on the way to the favourite itself.
    const lockedNodes = NodeHelper.traceMany([...nodes]).filter(n => !n.unlocked && !n.item?.unlocked);
    CostHelper.add(total, ...lockedNodes);
    return total;
  });

  /** Real-money total of the IAPs that carry these favourites; each IAP counted once. */
  readonly price = computed(() => {
    const bag = this._available();
    const seen = new Set<string>();
    let price = 0;
    for (const row of this.rows()) {
      const iap = bag.iaps.get(row.item.guid);
      if (!iap || seen.has(iap.guid)) { continue; }
      seen.add(iap.guid);
      price += iap.price || 0;
    }
    return price;
  });

  constructor() {
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => this._revision.update(v => v + 1));
    this._eventService.itemFavourited.pipe(takeUntilDestroyed()).subscribe(() => this._revision.update(v => v + 1));
  }

  showHelp(): void {
    window.alert(
      'This section your favourite items that are available right now, '
      + 'for a limited time: from the season, an event, the traveling spirit or a special visit.'
      + '\n\nUse "View favourites" to see all of your favourite items.'
    );
  }

  private addTree(bag: ISourceBag, tree: ISpiritTree | undefined, label: string): void {
    for (const node of TreeHelper.getNodes(tree)) {
      if (!node.item) { continue; }
      bag.items.set(node.item.guid, node.item);
      bag.nodes.set(node.item.guid, node);
      if (!bag.labels.has(node.item.guid)) { bag.labels.set(node.item.guid, label); }
    }
  }

  private addShop(bag: ISourceBag, shop: IShop, label: string): void {
    shop.iaps?.forEach(iap => iap.items?.forEach(item => {
      bag.items.set(item.guid, item);
      bag.iaps.set(item.guid, iap);
      if (!bag.labels.has(item.guid)) { bag.labels.set(item.guid, label); }
    }));

    shop.itemList?.items?.forEach(listNode => {
      bag.items.set(listNode.item.guid, listNode.item);
      bag.lists.set(listNode.item.guid, listNode);
      if (!bag.labels.has(listNode.item.guid)) { bag.labels.set(listNode.item.guid, label); }
    });
  }
}
