import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { AtmosIapCardComponent, AtmosItemListComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosShopQuickActionsComponent } from '../quick-actions/atmos-shop-quick-actions.component';
import { AtmosQuickActionsComponent } from '@app/redesign/shared/quick-actions/atmos-quick-actions.component';

@Component({
  selector: 'app-atmos-shop-cinema',
  templateUrl: './atmos-shop-cinema.component.html',
  styleUrl: './atmos-shop-cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AtmosIapCardComponent, AtmosItemListComponent, AtmosShopQuickActionsComponent, AtmosQuickActionsComponent]
})
export class AtmosShopCinemaComponent {
  private readonly _iapService = inject(IAPService);

  readonly iapShops: ReadonlyArray<IShop>;
  readonly igcShops: ReadonlyArray<IShop>;

  readonly highlightIap = signal<string | undefined>(undefined);
  readonly highlightNode = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'cinema');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightIap.set(p.get('highlightIap') || undefined);
    this.highlightNode.set(p.get('highlightNode') || undefined);
  }

  togglePurchased(iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(iap: IIAP): void {
    this._iapService.toggleGifted(iap);
  }
}
