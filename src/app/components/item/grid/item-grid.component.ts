import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ItemIconComponent } from '../icon/item-icon.component';
import { SUBICONS_ALL } from '../icon/subicons/item-subicons.component';
import { DataService } from '@app/services/data.service';
import { ItemGridLayoutComponent } from './item-grid-layout.component';
import { ItemQuickActionsComponent } from '../quick-actions/item-quick-actions.component';
import { IItem } from 'skygame-data';
import { TooltipDirective } from '@app/directives/tooltip.directive';

@Component({
  selector: 'app-item-grid',
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, ItemIconComponent, ItemGridLayoutComponent, ItemQuickActionsComponent]
})
export class ItemGridComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly items: ReadonlyArray<IItem>;

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items;
  }
}
