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
  selector: 'app-shop-harmony-hall',
  templateUrl: './shop-harmony-hall.component.html',
  styleUrl: './shop-harmony-hall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, IapCardComponent, ItemListComponent, SpiritTreeComponent, ShopQuickActionsComponent, QuickActionsComponent]
})
export class ShopHarmonyHallComponent {
  private readonly _iapService = inject(IAPService);

  readonly iapShops: ReadonlyArray<IShop>;
  readonly igcShops: ReadonlyArray<IShop>;
  readonly tree: ISpiritTree;

  readonly highlightIap = signal<string | undefined>(undefined);
  readonly highlightNode = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === 'harmony');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);
    this.tree = dataService.guidMap.get('bkdgyeUcbZ') as ISpiritTree;

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
