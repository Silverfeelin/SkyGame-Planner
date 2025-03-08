import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IShop } from '@app/interfaces/shop.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent } from "../../layout/card/card.component";
import { ItemListComponent } from "../../item-list/item-list/item-list.component";
import { IIAP } from '@app/interfaces/iap.interface';
import { IAPService } from '@app/services/iap.service';
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { IapCardComponent } from "../../iap/iap-card/iap-card.component";
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { SpiritTreeComponent } from "../../spirit-tree/spirit-tree.component";

@Component({
    selector: 'app-shop-event-store',
    imports: [CardComponent, ItemListComponent, WikiLinkComponent, IapCardComponent, SpiritTreeComponent],
    templateUrl: './shop-event-store.component.html',
    styleUrl: './shop-event-store.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopEventStoreComponent {
  igcShops: Array<IShop> = [];
  iapShops: Array<IShop> = [];

  propShop: ISpiritTree;
  highlightIap?: string;
  highlightNode?: string;
  highlightItem?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    const shops =_dataService.shopConfig.items.filter(s => s.permanent === 'event');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);
    this.propShop = _dataService.guidMap.get('TbheKd0E45') as ISpiritTree;
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
    this.highlightItem = p.get('highlightItem') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
