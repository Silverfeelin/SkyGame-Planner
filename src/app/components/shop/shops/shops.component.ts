import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { IapCardComponent, ItemListComponent } from '@app/components/shared/shared-widgets';
import { ShopQuickActionsComponent } from '../quick-actions/shop-quick-actions.component';

interface IVenue {
  readonly link: string;
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
}

const VENUES: ReadonlyArray<IVenue> = [
  {
    link: '/shop/event',
    title: 'Aviary Event Store',
    description: 'Introduced in the Season of Revival. Accessed through Aviary Village.'
  },
  {
    link: '/shop/cinema',
    title: 'Cinema',
    description: 'Introduced in the Season of Two Embers - Part One. Reached via the Collaboration Room from Aviary Village.'
  },
  {
    link: '/shop/concert-hall',
    title: 'Concert Hall',
    description: 'Introduced in the Season of Duets. Accessed through Aviary Village.'
  },
  {
    link: '/shop/harmony',
    title: 'Harmony Hall',
    description: 'Introduced in the Season of Performance. Reached from Aviary Village, the Village of Dreams or the Village Theatre.'
  },
  {
    link: '/shop/nesting',
    title: 'Nesting Workshop',
    description: 'Introduced in the Season of Nesting. Accessed through Aviary Village.'
  },
  {
    link: '/shop/office',
    title: 'Secret Area',
    description: 'Only available with a certain cape or during some events. Accessed through the Vault of Knowledge.'
  },
  {
    link: '/shop/prairieheights',
    title: 'Prairie Heights',
    description: 'Kite shop introduced during Days of Color in 2026. Accessed through Prairie Village (8-player puzzle).'
  },
  {
    link: '/shop/wonderland-cafe',
    title: 'Wonderland Cafe',
    description: 'Introduced during Days of Feast in 2024. Accessed through the Wonderland Cafe Corridor.'
  }
];

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, IapCardComponent, ItemListComponent, ShopQuickActionsComponent]
})
export class ShopsComponent {
  private readonly _iapService = inject(IAPService);

  readonly venues = VENUES;
  readonly iapShops: ReadonlyArray<IShop>;
  readonly igcShops: ReadonlyArray<IShop>;

  readonly highlightIap = signal<string | undefined>(undefined);
  readonly highlightNode = signal<string | undefined>(undefined);

  constructor(dataService: DataService, route: ActivatedRoute) {
    const shops = dataService.shopConfig.items.filter(s => s.permanent === true);
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.igcShops = shops.filter(s => s.itemList);

    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(p: ParamMap): void {
    this.highlightIap.set(p.get('highlightIap') || undefined);
    this.highlightNode.set(p.get('highlightNode') || undefined);
  }

  togglePurchased(iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(iap: IIAP): void {
    this._iapService.toggleGifted(iap);
  }
}
