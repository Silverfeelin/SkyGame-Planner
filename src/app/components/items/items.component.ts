import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, convertToParamMap, RouterLink } from '@angular/router';
import { ItemHelper } from 'src/app/helpers/item-helper';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgIf, NgFor } from '@angular/common';
import { ItemTypeSelectorComponent } from './item-type-selector/item-type-selector.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, MatIcon, ItemTypeSelectorComponent, NgIf, NgbTooltip, NgFor, ItemIconComponent]
})
export class ItemsComponent {
  type?: ItemType;

  // Item details.
  selectedItem?: IItem;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  shownUnlocked: number = 0;
  shownCount: number = 0;
  shownIncludesFav = false;

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

    const fav = query.get('fav') === '1';
    this.filterByFav = fav;

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
    this.shownIncludesFav = this.filterByFav && this.shownItems.some(item => item.favourited);

    this._changeDetectionRef.markForCheck();
  }

  toggleFav(): void {
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['fav'] = this.filterByFav ? null : '1';

    void this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onTypeChanged(type: ItemType): void {
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['type'] = type;
    this.selectedItem ? queryParams['item'] = this.selectedItem.guid : delete queryParams['item'];

    void this._router.navigate([], { queryParams, replaceUrl: true });
  }

  private initializeItems(): void {
    // Clear data.
    this.typeItems = {};
    this.typeUnlocked = {};
    for (const type in ItemType) {
      this.typeItems[type] = [];
      this.typeUnlocked[type] = 0;
    }

    // Load all items.
    const items = this._dataService.itemConfig.items;
    items.forEach(item => {
      this.typeItems[item.type].push(item);
      if (item.unlocked) { this.typeUnlocked[item.type]++; }
    });

    // Sort by order.
    for (const type in ItemType) {
      ItemHelper.sortItems(this.typeItems[type]);
    }
  }
}
