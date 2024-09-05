import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ItemsComponent } from "../items.component";
import { IItem, ItemType } from '@app/interfaces/item.interface';
import { ItemTypeSelectorComponent } from "../item-type-selector/item-type-selector.component";
import { NavigationHelper } from '@app/helpers/navigation-helper';
import { ItemService } from '@app/services/item.service';
import { DataService } from '@app/services/data.service';
import { ItemTypePipe } from "../../../pipes/item-type.pipe";
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-items-overview',
  standalone: true,
  imports: [RouterLink, MatIcon, ItemsComponent, ItemTypeSelectorComponent, ItemTypePipe, LowerCasePipe],
  templateUrl: './items-overview.component.html',
  styleUrl: './items-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsOverviewComponent {
  type = ItemType.Outfit;
  highlightItem?: IItem;

  itemCount = 0;
  unlockedCount = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _itemService: ItemService
  ) {
    const type = new URL(location.href).searchParams.get('type');
    this.onTypeChanged(type as ItemType || ItemType.Outfit);
  }

  onTypeChanged(type: ItemType): void {
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['type'] = type;
    this.highlightItem ? queryParams['item'] = this.highlightItem.guid : delete queryParams['item'];

    this.type = type as ItemType || ItemType.Outfit;
    const items = this._itemService.getByType(this.type);
    this.itemCount = items.length;
    this.unlockedCount = items.filter(item => item.unlocked).length;

    // Select item from query.
    const url = new URL(location.href);
    const itemGuid = url.searchParams.get('item') || '';
    if (itemGuid) {
      this.highlightItem = this._dataService.guidMap.get(itemGuid) as IItem;
    }

    // Add type to URL.
    this.type === ItemType.Outfit
      ? url.searchParams.delete('type')
      : url.searchParams.set('type', this.type);
    history.replaceState(window.history.state, '', url.toString());
  }
}
