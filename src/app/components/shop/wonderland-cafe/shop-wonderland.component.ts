import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { ItemListComponent } from '@app/components/shared/shared-widgets';
import { ShopQuickActionsComponent } from '../quick-actions/shop-quick-actions.component';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

@Component({
  selector: 'app-shop-wonderland',
  templateUrl: './shop-wonderland.component.html',
  styleUrl: './shop-wonderland.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemListComponent, ShopQuickActionsComponent, QuickActionsComponent]
})
export class ShopWonderlandComponent {
  readonly igcShops: ReadonlyArray<IShop>;

  readonly highlightNode = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'wonderland');
    this.igcShops = shops.filter(s => s.itemList);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightNode.set(p.get('highlightNode') || undefined);
    this.highlightItem.set(p.get('highlightItem') || undefined);
  }
}
