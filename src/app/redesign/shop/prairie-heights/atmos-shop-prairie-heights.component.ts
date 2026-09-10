import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { AtmosItemListComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosShopQuickActionsComponent } from '../quick-actions/atmos-shop-quick-actions.component';
import { AtmosQuickActionsComponent } from '@app/redesign/shared/quick-actions/atmos-quick-actions.component';

@Component({
  selector: 'app-atmos-shop-prairie-heights',
  templateUrl: './atmos-shop-prairie-heights.component.html',
  styleUrl: './atmos-shop-prairie-heights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AtmosItemListComponent, AtmosShopQuickActionsComponent, AtmosQuickActionsComponent]
})
export class AtmosShopPrairieHeightsComponent {
  readonly igcShops: ReadonlyArray<IShop>;

  readonly highlightNode = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'prairieheights');
    this.igcShops = shops.filter(s => s.itemList);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightNode.set(p.get('highlightNode') || undefined);
    this.highlightItem.set(p.get('highlightItem') || undefined);
  }
}
