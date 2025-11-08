import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { SearchService } from 'src/app/services/search.service';
import { ItemSubIconsComponent } from '../item-icon/item-subicons/item-subicons.component';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NgFor, NgIf } from '@angular/common';
import { ItemTypeSelectorComponent } from '../item-type-selector/item-type-selector.component';

@Component({
    selector: 'app-item-field-guide',
    templateUrl: './item-field-guide.component.html',
    styleUrls: ['./item-field-guide.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ItemTypeSelectorComponent, NgFor, NgIf, RouterLink, NgbTooltip, ItemIconComponent, ItemSubIconsComponent]
})
export class ItemFieldGuideComponent {
  type: ItemType = ItemType.Outfit;
  types: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];

  typeItems: { [key: string]: Array<{ item: IItem, nav?: INavigationTarget }> } = {};
  loadedTypes: { [key: string]: boolean } = {};
  viewingSource = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _searchService: SearchService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.initializeItems();

    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;
    this.type = type as ItemType || ItemType.Outfit;
    this.loadedTypes[this.type] = true;
  }

  onTypeChanged(type: ItemType): void {
    this.type = type;
    const queryParams: Params = {};
    queryParams['type'] = type;
    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  checkViewSource(url: string) {
    if (!this.viewingSource) {
      return;
    }

    if (!url?.startsWith('https://static.wikia.nocookie.net/sky-children-of-the-light')) {
      alert(`Can't view the source since this image is not hosted on the official wiki.`);
      return;
    }

    const file = url.match(/[^/]*$/)?.[0];
    if (!file) {
      alert(`Can't find the file name.`);
      return;
    }

    window.open(`https://sky-children-of-the-light.fandom.com/wiki/File:${file}`, '_blank');
  }

  private initializeItems(): void {
    this.typeItems = {};
    for (const type in ItemType) {
      this.typeItems[type] = [];
    }

    // Load all items with preview.
    this._dataService.itemConfig.items.forEach(item => {
      if (!item.previewUrl) { return; }
      const nav = NavigationHelper.getItemLink(item);
      this.typeItems[item.type].push({ item, nav });
    });

    // Sort by order.
    for (const type in ItemType) {
      this.typeItems[type].sort((a, b) => (a.item.order ?? 99999) - (b.item.order ?? 99999));
    }
  }
}
