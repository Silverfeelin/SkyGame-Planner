import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@app/components/icon/icon.component';
import { DataService } from '@app/services/data.service';
import { AtmosItemGridLayoutComponent } from './atmos-item-grid-layout.component';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';
import { IItem } from 'skygame-data';

@Component({
  selector: 'atmos-item-grid',
  templateUrl: './atmos-item-grid.component.html',
  styleUrl: './atmos-item-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, AtmosItemGridLayoutComponent, AtmosItemQuickActionsComponent]
})
export class AtmosItemGridComponent {
  readonly items: ReadonlyArray<IItem>;

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items;
  }
}
