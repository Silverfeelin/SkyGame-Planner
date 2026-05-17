import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { CardComponent } from '@app/components/layout/card/card.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { IapCardComponent } from "../../iap/iap-card/iap-card.component";
import { IShop, IIAP } from 'skygame-data';
import { ItemListComponent } from "@app/components/item-list/item-list/item-list.component";

@Component({
    selector: 'app-shop-wonderland',
    imports: [CardComponent, WikiLinkComponent, ItemListComponent],
    templateUrl: './shop-wonderland.component.html',
    styleUrl: './shop-wonderland.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopWonderlandComponent {
  igcShops: Array<IShop> = [];

  highlightNode?: string;
  highlightItem?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    const shops =_dataService.shopConfig.items.filter(s => s.permanent === 'wonderland');
    this.igcShops = shops.filter(s => s.itemList);
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightNode = p.get('highlightNode') || undefined;
    this.highlightItem = p.get('highlightItem') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
