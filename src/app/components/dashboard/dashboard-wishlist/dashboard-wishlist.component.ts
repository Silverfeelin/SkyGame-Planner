import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

type Bag = { [guid: string]: IItem };

@Component({
  selector: 'app-dashboard-wishlist',
  templateUrl: './dashboard-wishlist.component.html',
  styleUrls: ['./dashboard-wishlist.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWishlistComponent implements OnChanges, OnDestroy {
  // Ongoing
  @Input() season?: ISeason;
  @Input() eventInstances?: Array<IEventInstance>;
  @Input() ts?: ITravelingSpirit;
  @Input() rs?: IReturningSpirits;

  shouldShow = false;

  items: Array<IItem> = [];
  itemMap: Bag = {};
  itemLinks: { [guid: string]: INavigationTarget | undefined } = {};

  ongoingSeasonItems: Bag = {};
  ongoingEventItems: Bag = {};
  ongoingTsItems: Bag = {};
  ongoingRsItems: Bag = {};
  ongoingItems: Bag = {};

  _subs = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.checkFavourites();
    this._subs.add(_eventService.itemToggled.subscribe(item => this.onItemToggled(item)));
    this._subs.add(_eventService.itemFavourited.subscribe(item => this.onItemFavourited(item)));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['season']) { this.loadSeason(); }
    if (changes['eventInstances']) { this.loadEvent(); }
    if (changes['ts']) { this.loadTs(); }
    if (changes['rs']) { this.loadRs(); }
    this.ongoingItems = { ...this.ongoingSeasonItems, ...this.ongoingEventItems, ...this.ongoingTsItems, ...this.ongoingRsItems };
    this.shouldShow = this.items.some(item => this.ongoingItems[item.guid]);
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private onItemToggled(item: IItem): void {
    this.checkItem(item);
    this.shouldShow = this.items.some(item => this.ongoingItems[item.guid]);
    this._changeDetectorRef.markForCheck();
  }

  private onItemFavourited(item: IItem): void {
    this.checkItem(item);
    this.shouldShow = this.items.some(item => this.ongoingItems[item.guid]);
    this._changeDetectorRef.markForCheck();
  }

  private checkFavourites(): void {
    this._storageService.getFavourites().forEach(guid => {
      const item = this._dataService.guidMap.get(guid) as IItem;
      if (!item) { return; }
      this.checkItem(item);
    });
    this.shouldShow = this.items.some(item => this.ongoingItems[item.guid]);
  }

  private checkItem(item: IItem): void {
    const shouldAdd = item.favourited && !item.unlocked

    // Add item
    if (shouldAdd && !this.itemMap[item.guid]) {
      this.itemMap[item.guid] = item;
      this.itemLinks[item.guid] = NavigationHelper.getItemSource(item);
      this.items.push(item);
    }

    // Remove item
    if (!shouldAdd && this.itemMap[item.guid]) {
      delete this.itemMap[item.guid];
      delete this.itemLinks[item.guid];
      const i = this.items.findIndex(i => i.guid === item.guid);
      if (i > -1) { this.items.splice(i, 1); }
    }
  }

  private loadSeason(): void {
    this.ongoingSeasonItems = {};
    if (!this.season) { return; }
    this.season.spirits.forEach(spirit => {
      this.loadTree(spirit.tree, this.ongoingSeasonItems);
    });
  }

  private loadEvent(): void {
    this.ongoingEventItems = {};
    if (!this.eventInstances?.length) { return; }
    this.eventInstances.forEach(instance => {
      instance.spirits.forEach(spirit => {
        this.loadTree(spirit.tree, this.ongoingEventItems);
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

  private loadTree(tree: ISpiritTree | undefined, bag: Bag ): void {
    if (!tree) { return; }
    const items = NodeHelper.getItems(tree.node);
    items.forEach(item => bag[item.guid] = item);
  }
}
