import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { ItemHelper } from '@app/helpers/item-helper';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { IItem, ItemType } from '@app/interfaces/item.interface';
import { DataService } from '@app/services/data.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { ItemSubIconsComponent } from '../item-icon/item-subicons/item-subicons.component';
import { ItemTypeSelectorComponent } from '../item-type-selector/item-type-selector.component';
import { ItemTypePipe } from "../../../pipes/item-type.pipe";

@Component({
    selector: 'app-item-dyes',
    imports: [RouterLink, NgbTooltip, ItemIconComponent, ItemSubIconsComponent, ItemTypeSelectorComponent, ItemTypePipe],
    templateUrl: './item-dyes.component.html',
    styleUrl: './item-dyes.component.scss'
})
export class ItemDyesComponent {
  type: ItemType = ItemType.Outfit;
  types: Array<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape
  ];


  typeItems: { [key: string]: Array<{ item: IItem, nav?: INavigationTarget }> } = {};
  loadedTypes: { [key: string]: boolean } = {};
  viewingSource = false;

  items!: Array<IItem>;

  constructor(
    private readonly _dataService: DataService,
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

  openImg(evt: Event): void {
    const src = (evt.target as HTMLImageElement).src;
    window.open(src, '_blank');
  }

    private initializeItems(): void {
      this.typeItems = {};
      for (const type in ItemType) {
        this.typeItems[type] = [];
      }

      // Load all items with preview.
      this._dataService.itemConfig.items.forEach(item => {
        if (!item.dye?.previewUrl) { return; }
        const nav = NavigationHelper.getItemLink(item);
        this.typeItems[item.type].push({ item, nav });
      });

      // Sort by order.
      for (const type in ItemType) {
        this.typeItems[type].sort((a, b) => (a.item.order ?? 99999) - (b.item.order ?? 99999));
      }
    }
}
