import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IShop } from '@app/interfaces/shop.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent } from "../../layout/card/card.component";
import { ItemListComponent } from "../../item-list/item-list/item-list.component";
import { ItemIconComponent } from "../../items/item-icon/item-icon.component";
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IIAP } from '@app/interfaces/iap.interface';
import { IAPService } from '@app/services/iap.service';
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { IapCardComponent } from "../../iap/iap-card/iap-card.component";

@Component({
  selector: 'app-shop-event-store',
  standalone: true,
  imports: [CardComponent, ItemListComponent, ItemIconComponent, MatIcon, NgbTooltip, WikiLinkComponent, IapCardComponent],
  templateUrl: './shop-event-store.component.html',
  styleUrl: './shop-event-store.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopEventStoreComponent {
  igcShops: Array<IShop> = [];
  iapShops: Array<IShop> = [];

  highlightIap?: string;
  highlightNode?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    const shops =_dataService.shopConfig.items.filter(s => s.permanent === 'event');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
