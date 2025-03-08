import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { DataService } from 'src/app/services/data.service';
import { IAPService } from 'src/app/services/iap.service';
import { ItemListComponent } from '../item-list/item-list/item-list.component';
import { CardComponent } from '../layout/card/card.component';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { IapCardComponent } from '../iap/iap-card/iap-card.component';

@Component({
    selector: 'app-shops',
    templateUrl: './shops.component.html',
    styleUrls: ['./shops.component.less'],
    imports: [WikiLinkComponent, CardComponent, IapCardComponent, ItemListComponent, RouterLink]
})
export class ShopsComponent {
  iapShops: Array<IShop>;
  shops: Array<IShop>;
  highlightIap?: string;
  highlightNode?: string;


  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    const shops = this._dataService.shopConfig.items.filter(s => s.permanent === true);
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.shops = shops.filter(s => s.itemList);

    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
