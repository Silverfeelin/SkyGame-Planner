import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, convertToParamMap } from '@angular/router';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsComponent {
  type?: ItemType;
  typeEmote: ItemType = ItemType.Emote;

  items!: Array<IItem>;

  // Item details.
  selectedItem?: IItem;
  selectedItemNav?: INavigationTarget;
  _scrollToPreview = 0;

  columns?: number;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};
  emotes: { [key: string]: IItem } = {};
  emoteLevels: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  shownUnlocked: number = 0;

  shouldShowNone = true;
  showNone = false;
  offsetNone = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.initializeItems();
    this.columns = +(localStorage.getItem('item.columns') as string) || undefined;
    this.shouldShowNone = localStorage.getItem('item.none') !== '0';

    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;

    this.type = type as ItemType || ItemType.Outfit;
    this.shownItems = this.typeItems[this.type] ?? [];
    this.shownUnlocked = this.typeUnlocked[this.type] ?? 0;

    if (this.type === ItemType.Emote) {
      this.shownItems = Object.values(this.emotes);
      this.shownUnlocked = this.shownItems.filter(item => item.unlocked && item.level === this.emoteLevels[item.name]).length;
    }

    /* Async test
    let shown: Array<IItem> = [];
    let toShow = [...this.shownItems];
    const o = interval(1).subscribe(() => {
      shown.push(...toShow.slice(shown.length, shown.length + 10));
      if (shown.length == toShow.length) { o.unsubscribe(); }
      this.shownItemsAsync.next(shown);
    });
    */

    this.updateShowNone();

    // Select item from query.
    const itemGuid = query.get('item') || '';
    if (itemGuid) {
      this.selectedItem = this._dataService.guidMap.get(itemGuid) as IItem;
      this.selectedItemNav = this.selectedItem ? NavigationHelper.getItemSource(this.selectedItem) : undefined;
    }
  }

  setColumns(): void {
    switch (this.columns) {
      case 3: this.columns = 4; break;
      case 4: this.columns = 5; break;
      case 5: this.columns = 6; break;
      case 6: this.columns = undefined; break;
      default: this.columns = 3; break;
    }

    localStorage.setItem('item.columns', `${this.columns || ''}`);
  }

  toggleNone(): void {
    this.shouldShowNone = !this.shouldShowNone;
    localStorage.setItem('item.none', this.shouldShowNone ? '1' : '0')
    this.updateShowNone();
  }

  updateShowNone(): void {
    this.showNone = this.shouldShowNone && (this.type === ItemType.Necklace || this.type === ItemType.Hat || this.type === ItemType.Held || this.type === ItemType.Shoes || this.type === ItemType.FaceAccessory);
    this.offsetNone = this.showNone ? 1 : 0;
    this._changeDetectionRef.markForCheck();
  }

  onTypeChanged(type: ItemType): void {
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['type'] = type;
    this.selectedItem ? queryParams['item'] = this.selectedItem.guid : delete queryParams['item'];

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  private initializeItems(): void {
    // Clear data.
    this.typeItems = {};
    this.typeUnlocked = {};
    for (const type in ItemType) {
      this.typeItems[type] = [];
      this.typeUnlocked[type] = 0;
    }

    const addItem = (type: string, item: IItem): void => {
      this.typeItems[type].push(item);
      if (item.unlocked) { this.typeUnlocked[type]++; }
    }

    // Load all items. Group subtypes together based on which wardrobe they appear in.
    this.items = this._dataService.itemConfig.items.slice();
    this.items.forEach(item => {
      if (item.type === 'Emote') {
        // Save highest level emote.
        if (!this.emoteLevels[item.name] || item.level! > this.emoteLevels[item.name]) { this.emoteLevels[item.name] = item.level!; }
        // Save highest unlocked emote.
        if (!this.emotes[item.name] || item.unlocked) {
          this.emotes[item.name] = item;
        }
        return;
      }
      addItem(item.type, item);
    });

    // Sort by order.
    for (const type in ItemType) {
      ItemHelper.sortItems(this.typeItems[type]);
    }
  }
}
