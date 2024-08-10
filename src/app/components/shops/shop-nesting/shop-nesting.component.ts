import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IShop } from '@app/interfaces/shop.interface';
import { ISpirit } from '@app/interfaces/spirit.interface';
import { DataService } from '@app/services/data.service';
import { CardComponent } from "../../layout/card/card.component";
import { SpiritTreeComponent } from "../../spirit-tree/spirit-tree.component";
import { WikiLinkComponent } from "../../util/wiki-link/wiki-link.component";
import { ItemListComponent } from "../../item-list/item-list/item-list.component";
import { ParamMap } from '@angular/router';

@Component({
  selector: 'app-shop-nesting',
  standalone: true,
  imports: [CardComponent, SpiritTreeComponent, WikiLinkComponent, ItemListComponent],
  templateUrl: './shop-nesting.component.html',
  styleUrl: './shop-nesting.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopNestingComponent {
  challengeSpirits: Array<ISpirit>;
  nestingWorkshop: IShop;

  highlightIap?: string;
  highlightNode?: string;

  constructor(
    private readonly _dataService: DataService
  ) {
    this.challengeSpirits = [ 'os6ryCdFZ5', 'Gp-hW_NCv_', 'IhAh5oTvF8' ].map(g => this._dataService.guidMap.get(g)!) as Array<ISpirit>;
    this.nestingWorkshop = _dataService.guidMap.get('he4MHA7_uC') as IShop;
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightIap = p.get('highlightIap') || undefined;
    this.highlightNode = p.get('highlightNode') || undefined;
  }
}
