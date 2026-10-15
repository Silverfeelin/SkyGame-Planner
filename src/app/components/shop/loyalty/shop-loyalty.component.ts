import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { ItemListComponent } from '@app/components/shared/shared-widgets';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';

@Component({
  selector: 'app-shop-loyalty',
  templateUrl: './shop-loyalty.component.html',
  styleUrl: './shop-loyalty.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemListComponent, SectionQuickActionsComponent]
})
export class ShopLoyaltyComponent {
  readonly shops: ReadonlyArray<IShop>;

  readonly highlightNode = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    this.shops = dataService.shopConfig.items.filter(s => s.permanent === 'loyalty' && s.itemList);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightNode.set(p.get('highlightNode') || undefined);
    this.highlightItem.set(p.get('highlightItem') || undefined);
  }
}
