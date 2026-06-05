import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { AtmosItemListComponent } from '@app/redesign/shared/atmos-shared-widgets';

@Component({
  selector: 'app-atmos-shop-wonderland',
  templateUrl: './atmos-shop-wonderland.component.html',
  styleUrl: './atmos-shop-wonderland.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosItemListComponent]
})
export class AtmosShopWonderlandComponent {
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
