import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { CardComponent } from '@app/components/layout/card/card.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IShop } from '@app/interfaces/shop.interface';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { IIAP } from '@app/interfaces/iap.interface';
import { IapCardComponent } from "../../iap/iap-card/iap-card.component";

@Component({
    selector: 'app-shop-cinema',
    imports: [CardComponent, WikiLinkComponent, IapCardComponent],
    templateUrl: './shop-cinema.component.html',
    styleUrl: './shop-cinema.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopCinemaComponent {
  iapShops: Array<IShop> = [];

  highlightIap?: string;
  highlightNode?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    const shops =_dataService.shopConfig.items.filter(s => s.permanent === 'cinema');
    this.iapShops = shops.filter(s => s.iaps?.length);
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
