import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { AtmosIapCardComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosShopQuickActionsComponent } from '../quick-actions/atmos-shop-quick-actions.component';

@Component({
  selector: 'app-atmos-shop-cinema',
  templateUrl: './atmos-shop-cinema.component.html',
  styleUrl: './atmos-shop-cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AtmosIapCardComponent, AtmosShopQuickActionsComponent]
})
export class AtmosShopCinemaComponent {
  private readonly _iapService = inject(IAPService);

  readonly iapShops: ReadonlyArray<IShop>;

  readonly highlightIap = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'cinema');
    this.iapShops = shops.filter(s => s.iaps?.length);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightIap.set(p.get('highlightIap') || undefined);
  }

  togglePurchased(iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(iap: IIAP): void {
    this._iapService.toggleGifted(iap);
  }
}
