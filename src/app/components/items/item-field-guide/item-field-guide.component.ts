import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-item-field-guide',
  templateUrl: './item-field-guide.component.html',
  styleUrls: ['./item-field-guide.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemFieldGuideComponent {
  type: ItemType = ItemType.Outfit;
  types: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.Hat,
    ItemType.Cape, ItemType.Held, ItemType.Prop
  ];

  typeItems: { [key: string]: Array<{ item: IItem, nav?: INavigationTarget }> } = {};
  loadedTypes: { [key: string]: boolean } = {};
  highlight?: string;

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

    this.highlight = query.get('item') || undefined;
  }

  onTypeChanged(type: ItemType): void {
    this.type = type;
    const queryParams: Params = {};
    queryParams['type'] = type;
    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  removeHighlight(): void {
    setTimeout(() => {
      this.highlight = undefined;
    });
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
