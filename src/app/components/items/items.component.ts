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
import { NgIf, NgFor, NgTemplateOutlet } from '@angular/common';
import { ItemTypeSelectorComponent } from './item-type-selector/item-type-selector.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, MatIcon, ItemTypeSelectorComponent, NgIf, NgbTooltip, NgFor, NgTemplateOutlet, ItemIconComponent]
})
export class ItemsComponent {
  type?: ItemType;

  // Item details.
  selectedItem?: IItem;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  filteredItems: Array<IItem> = [];
  shownUnlocked: number = 0;
  shownCount: number = 0;
  shownIncludesFav = false;

  showFilters = false;
  filters = {
    favouriteOnly: false,
    hideLimited: false,
    hideOwned: false,
    hideMissing: false
  };

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _changeDetectionRef: ChangeDetectorRef
  ) {
    this.loadSettings();
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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.updateShownItems();
  }

  toggleFilter(filter: string) {
    (this.filters as any)[filter] = !(this.filters as any)[filter];
    this.saveSettings();
    this.updateShownItems();
  }

  private updateShownItems(): void {
    this.shownItems = this.typeItems[this.type!] ?? [];
    this.shownCount = this.shownItems.length;
    this.shownUnlocked = this.typeUnlocked[this.type!] ?? 0;

    if (this.showFilters) {
      this.filteredItems = this.shownItems.filter(item => {
        if (this.filters.favouriteOnly && !item.favourited) { return false; }
        if (this.filters.hideLimited && (item.group === 'Limited' || item.group === 'Ultimate')) { return false; }
        if (this.filters.hideOwned && item.unlocked) { return false; }
        if (this.filters.hideMissing && !item.unlocked) { return false; }
        return true;
      });
    } else {
      this.filteredItems = this.shownItems;
    }

    this._changeDetectionRef.markForCheck();
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

  private saveSettings(): void {
    localStorage.setItem('items.filters', JSON.stringify(this.filters));
  }

  private loadSettings(): void {
    this.filters = JSON.parse(localStorage.getItem('items.filters') || '{}');
  }
}
