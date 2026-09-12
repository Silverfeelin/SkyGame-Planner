import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@app/components/icon/icon.component';
import { DataService } from '@app/services/data.service';
import { ItemGridLayoutComponent } from './item-grid-layout.component';
import { ItemQuickActionsComponent } from '../quick-actions/item-quick-actions.component';
import { IItem } from 'skygame-data';

@Component({
  selector: 'app-item-grid',
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ItemGridLayoutComponent, ItemQuickActionsComponent]
})
export class ItemGridComponent {
  readonly items: ReadonlyArray<IItem>;

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items;
  }
}
