import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IShop } from '@app/interfaces/shop.interface';
import { DataService } from '@app/services/data.service';
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { MatIcon } from '@angular/material/icon';
import { ItemListComponent } from '@app/components/item-list/item-list/item-list.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { CardComponent } from '@app/components/layout/card/card.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IAPService } from '@app/services/iap.service';
import { IIAP } from '@app/interfaces/iap.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { SpiritTreeComponent } from "../../spirit-tree/spirit-tree.component";

@Component({
  selector: 'app-shop-harmony-hall',
  standalone: true,
  imports: [CardComponent, ItemListComponent, ItemIconComponent, MatIcon, NgbTooltip, WikiLinkComponent, SpiritTreeComponent],
  templateUrl: './shop-harmony-hall.component.html',
  styleUrl: './shop-harmony-hall.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopHarmonyHallComponent {
  igcShops: Array<IShop> = [];
  iapShops: Array<IShop> = [];
  tree: ISpiritTree;

  highlightIap?: string;
  highlightNode?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));

    const shops =_dataService.shopConfig.items.filter(s => s.permanent === 'harmony');
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);

    this.tree = this._dataService.guidMap.get('bkdgyeUcbZ') as ISpiritTree;
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
