import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IItemListNode } from 'src/app/interfaces/item-list.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { CostComponent } from '../../util/cost/cost.component';
import { ItemIconComponent } from '../../items/item-icon/item-icon.component';
import { RouterLink } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CardComponent } from '../../layout/card/card.component';

type Bag = { [guid: string]: IItem };

@Component({
    selector: 'app-dashboard-wishlist',
    templateUrl: './dashboard-wishlist.component.html',
    styleUrls: ['./dashboard-wishlist.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CardComponent, NgbTooltip, RouterLink, ItemIconComponent, CostComponent]
})
export class DashboardWishlistComponent implements OnChanges, OnDestroy {
  // Ongoing
  @Input() season?: ISeason;
  @Input() eventInstances?: Array<IEventInstance>;
  @Input() ts?: ITravelingSpirit;
  @Input() rs?: IReturningSpirits;

  items: Array<IItem> = [];
  itemMap: Bag = {};
  itemLinks: { [guid: string]: INavigationTarget | undefined } = {};
  itemCost: ICost = { };
  iapPrice: number = 0;

  hasOngoingItems = false;
  ongoingSeasonItems: Bag = {};
  ongoingEventItems: Bag = {};
  ongoingTsItems: Bag = {};
  ongoingRsItems: Bag = {};
  ongoingItems: Bag = {};
  ongoingItemSources: {
    iaps: { [guid: string]: IIAP },
    nodes: { [guid: string]: INode },
    lists: { [guid: string]: IItemListNode }
  } = { iaps: {}, nodes: {}, lists: {}};

  _subs = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.loadFavourites();
    this._subs.add(_eventService.itemToggled.subscribe(item => this.onItemToggled(item)));
    this._subs.add(_eventService.itemFavourited.subscribe(item => this.onItemFavourited(item)));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.itemCost = CostHelper.create();
    if (changes['season']) { this.loadSeason(); }
    if (changes['eventInstances']) { this.loadEvent(); }
    if (changes['ts']) { this.loadTs(); }
    if (changes['rs']) { this.loadRs(); }
    this.ongoingItems = { ...this.ongoingSeasonItems, ...this.ongoingEventItems, ...this.ongoingTsItems, ...this.ongoingRsItems };
    this.checkHasOngoing();
    this.calculateCosts();
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private checkHasOngoing(): void {
    this.hasOngoingItems = this.items.some(item => this.ongoingItems[item.guid]);
  }

  private onItemToggled(item: IItem): void {
    this.checkItem(item);
    this.checkHasOngoing();
    this.calculateCosts();
    this._changeDetectorRef.markForCheck();
  }

  private onItemFavourited(item: IItem): void {
    this.checkItem(item);
    this.checkHasOngoing();
    this.calculateCosts();
    this._changeDetectorRef.markForCheck();
  }

  private loadFavourites(): void {
    const favourites = this._storageService.getFavourites();
    const items = [...favourites].map(g => {
      const item = this._dataService.guidMap.get(g) as IItem;
      return item;
    }).filter(i => i?.favourited && !i.unlocked);
    this.items = items;
    this.itemLinks = {};
    this.itemMap = items.reduce((acc, item) => {
      this.itemLinks[item.guid] = NavigationHelper.getItemSource(item);
      return (acc[item.guid] = item) && acc;
    }, {} as Bag);
  }

  private checkItem(item: IItem): void {
    if (item.favourited && !item.unlocked) {
      // Add item
      if (this.itemMap[item.guid]) { return; }
      this.itemMap[item.guid] = item;
      this.itemLinks[item.guid] = NavigationHelper.getItemSource(item);
      this.items.push(item);
    } else {
      // Remove item
      if (!this.itemMap[item.guid]) { return; }
      delete this.itemMap[item.guid];
      delete this.itemLinks[item.guid];
      const i = this.items.findIndex(i => i.guid === item.guid);
      if (i > -1) { this.items.splice(i, 1); }
    }
  }

  private calculateCosts(): void {
    this.itemCost = CostHelper.create();
    this.iapPrice = 0;
    const nodes = new Set<INode>();
    this.items.forEach(item => {
      const cost = this.ongoingItemSources.lists[item.guid];
      if (cost) { CostHelper.add(this.itemCost, cost); }

      const iap = this.ongoingItemSources.iaps[item.guid];
      if (iap) { this.iapPrice += iap.price || 0;  }

      const node = this.ongoingItemSources.nodes[item.guid];
      if (node) { nodes.add(node); }
    });

    const lockedNodes = NodeHelper.traceMany([...nodes]).filter(n => !n.unlocked && !n.item?.unlocked);
    CostHelper.add(this.itemCost, ...lockedNodes);
    this._changeDetectorRef.markForCheck();
  }

  private loadSeason(): void {
    this.ongoingSeasonItems = {};
    if (!this.season) { return; }
    this.season.spirits?.forEach(spirit => {
      this.loadTree(spirit.tree, this.ongoingSeasonItems);
    });
    this.season.shops?.forEach(shop => {
      this.loadShop(shop, this.ongoingSeasonItems);
    });
  }

  private loadEvent(): void {
    this.ongoingEventItems = {};
    if (!this.eventInstances?.length) { return; }
    this.eventInstances.forEach(instance => {
      instance.spirits?.forEach(spirit => {
        this.loadTree(spirit.tree, this.ongoingEventItems);
      });
      instance.shops?.forEach(shop => {
        this.loadShop(shop, this.ongoingEventItems);
      });
    });
  }

  private loadTs(): void {
    this.ongoingTsItems = {};
    if (!this.ts) { return; }
    this.loadTree(this.ts.tree, this.ongoingTsItems);
  }

  private loadRs(): void {
    this.ongoingRsItems = {};
    if (!this.rs) { return; }
    this.rs.spirits.forEach(spirit => {
      this.loadTree(spirit.tree, this.ongoingRsItems);
    });
  }

  private loadTree(tree: ISpiritTree | undefined, bag: Bag): void {
    if (!tree) { return; }
    const nodes = NodeHelper.all(tree.node);
    nodes.forEach(node => {
      if (!node.item) { return; }
      bag[node.item!.guid] = node.item!;
      this.ongoingItemSources.nodes[node.item!.guid] = node;
    });
  }

  private loadShop(shop: IShop, bag: Bag): void {
    shop.iaps?.forEach(iap => {
      iap.items?.forEach(item => {
        bag[item.guid] = item;
        this.ongoingItemSources.iaps[item.guid] = iap;
      });
    });

    shop.itemList?.items?.forEach(node => {
      bag[node.item.guid] = node.item;
      this.ongoingItemSources.lists[node.item.guid] = node;
    });
  }
}
