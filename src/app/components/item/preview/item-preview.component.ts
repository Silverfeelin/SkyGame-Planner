import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@app/components/icon/icon.component';
import { DataService } from '@app/services/data.service';
import { ItemGridLayoutComponent, ITEM_GRID_CATEGORIES } from '../grid/item-grid-layout.component';
import { ItemQuickActionsComponent } from '../quick-actions/item-quick-actions.component';
import { ItemSubIconsComponent, SUBICONS_ALL } from '../icon/subicons/item-subicons.component';
import { IItem, ItemType } from 'skygame-data';

@Component({
  selector: 'app-item-preview',
  templateUrl: './item-preview.component.html',
  styleUrl: './item-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ItemSubIconsComponent, ItemGridLayoutComponent, ItemQuickActionsComponent]
})
export class ItemPreviewComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly items: ReadonlyArray<IItem>;
  readonly initialCategory: ItemType;

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items.filter(i => !!i.previewUrl);
    const previewTypes = new Set(this.items.map(i => i.type));
    this.initialCategory = ITEM_GRID_CATEGORIES.find(c => previewTypes.has(c.type))?.type ?? ItemType.Outfit;
  }
}
