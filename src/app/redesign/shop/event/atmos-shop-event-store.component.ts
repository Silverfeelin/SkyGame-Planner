import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop, ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import {
  AtmosIapCardComponent,
  AtmosItemListComponent,
  AtmosSpiritTreeComponent
} from '@app/redesign/shared/atmos-shared-widgets';

@Component({
  selector: 'app-atmos-shop-event-store',
  templateUrl: './atmos-shop-event-store.component.html',
  styleUrl: './atmos-shop-event-store.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosIapCardComponent, AtmosItemListComponent, AtmosSpiritTreeComponent]
})
export class AtmosShopEventStoreComponent {
  private readonly _iapService = inject(IAPService);

  readonly iapShops: ReadonlyArray<IShop>;
  readonly igcShops: ReadonlyArray<IShop>;
  readonly propShop: ISpiritTree;

  readonly highlightIap = signal<string | undefined>(undefined);
  readonly highlightNode = signal<string | undefined>(undefined);
  readonly highlightItem = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'event');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);
    this.propShop = dataService.guidMap.get('TbheKd0E45') as ISpiritTree;

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightIap.set(p.get('highlightIap') || undefined);
    this.highlightNode.set(p.get('highlightNode') || undefined);
    this.highlightItem.set(p.get('highlightItem') || undefined);
  }

  togglePurchased(iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(iap: IIAP): void {
    this._iapService.toggleGifted(iap);
  }
}
