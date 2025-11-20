import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CardComponent } from '@app/components/layout/card/card.component';
import { SpiritTreeComponent } from '@app/components/spirit-tree/spirit-tree.component';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { ISpiritTree, IIAP } from 'skygame-data';

@Component({
    selector: 'app-shop-concert-hall',
    imports: [CardComponent, WikiLinkComponent, SpiritTreeComponent],
    templateUrl: './shop-concert-hall.component.html',
    styleUrl: './shop-concert-hall.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopConcertHallComponent {
  tree: ISpiritTree;

  highlightNode?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _iapService: IAPService,
    _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    this.tree = this._dataService.guidMap.get('4uhy67a14a') as ISpiritTree;
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightNode = p.get('highlightNode') || undefined;
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }
}
