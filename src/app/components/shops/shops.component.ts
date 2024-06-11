import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { IAPService } from 'src/app/services/iap.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.less']
})
export class ShopsComponent {
  iapShops: Array<IShop>;
  shops: Array<IShop>;
  highlightIap?: string;
  highlightNode?: string;

  challengeSpirits: Array<ISpirit>;
  nestingWorkshop?: IShop;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    const shops = this._dataService.shopConfig.items.filter(s => {
      if (!s.permanent) { return false; }
      if (s.guid !== 'he4MHA7_uC') { return true; }
      this.nestingWorkshop = s;
      return false;
    });
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.shops = shops.filter(s => s.itemList);

    this.challengeSpirits = [ 'os6ryCdFZ5', 'Gp-hW_NCv_', 'IhAh5oTvF8' ].map(g => this._dataService.guidMap.get(g)!) as Array<ISpirit>;

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
