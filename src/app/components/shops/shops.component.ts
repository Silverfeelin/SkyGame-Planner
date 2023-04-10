import { Component } from '@angular/core';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IShop } from 'src/app/interfaces/shop.interface';
import { DataService } from 'src/app/services/data.service';
import { IAPService } from 'src/app/services/iap.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.less']
})
export class ShopsComponent {
  shops: Array<IShop>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService
  ) {
    this.shops = this._dataService.shopConfig.items.filter(s => s.permanent);
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
