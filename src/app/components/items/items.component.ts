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

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};
  emotes: { [key: string]: IItem } = {};
  emoteLevels: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  shownUnlocked: number = 0;
  shownCount: number = 0;

  filterByFav = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.initializeItems();

    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;

    this.type = type as ItemType || ItemType.Outfit;
    this.updateShownItems();

    // Select item from query.
    const itemGuid = query.get('item') || '';
    if (itemGuid) {
      this.selectedItem = this._dataService.guidMap.get(itemGuid) as IItem;
    }
  }

  private updateShownItems(): void {
    this.shownItems = this.typeItems[this.type!] ?? [];
    this.shownCount = this.shownItems.length;
    this.shownUnlocked = this.typeUnlocked[this.type!] ?? 0;

    if (this.type === ItemType.Emote) {
      this.shownItems = Object.values(this.emotes);
      this.shownCount = this.shownItems.length;
      this.shownUnlocked = this.shownItems.filter(item => item.unlocked && item.level === this.emoteLevels[item.name]).length;
    }

    this._changeDetectionRef.markForCheck();
  }

  toggleFav(): void {
    this.filterByFav = !this.filterByFav;
    this.updateShownItems();
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
