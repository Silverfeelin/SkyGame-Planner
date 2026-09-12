import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop, ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import {
  IapCardComponent,
  ItemListComponent,
  SpiritTreeComponent
} from '@app/components/shared/shared-widgets';
import { ShopQuickActionsComponent } from '../quick-actions/shop-quick-actions.component';
import { QuickActionsComponent } from '@app/components/shared/quick-actions/quick-actions.component';

@Component({
  selector: 'app-shop-event-store',
  templateUrl: './shop-event-store.component.html',
  styleUrl: './shop-event-store.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, IapCardComponent, ItemListComponent, SpiritTreeComponent, ShopQuickActionsComponent, QuickActionsComponent]
})
export class ShopEventStoreComponent {
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
