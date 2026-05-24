import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@app/components/icon/icon.component';
import { DataService } from '@app/services/data.service';
import { AtmosItemGridLayoutComponent, ITEM_GRID_CATEGORIES } from '../grid/atmos-item-grid-layout.component';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';
import { IItem, ItemType } from 'skygame-data';

@Component({
  selector: 'atmos-item-dye',
  templateUrl: './atmos-item-dye.component.html',
  styleUrl: './atmos-item-dye.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AtmosItemGridLayoutComponent, AtmosItemQuickActionsComponent]
})
export class AtmosItemDyeComponent {
  readonly items: ReadonlyArray<IItem>;
  readonly initialCategory: ItemType;

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items.filter(i => !!i.dye?.previewUrl);
    const dyeTypes = new Set(this.items.map(i => i.type));
    this.initialCategory = ITEM_GRID_CATEGORIES.find(c => dyeTypes.has(c.type))?.type ?? ItemType.Outfit;
  }
}
