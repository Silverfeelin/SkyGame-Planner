import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IIAP, IShop } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { IAPService } from '@app/services/iap.service';
import { AtmosIapCardComponent, AtmosItemListComponent } from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosShopQuickActionsComponent } from '../quick-actions/atmos-shop-quick-actions.component';

interface IVenue {
  readonly link: string;
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
}

const VENUES: ReadonlyArray<IVenue> = [
  {
    link: '/r/shop/event',
    title: 'Aviary Event Store',
    description: 'Introduced in the Season of Revival. Accessed through Aviary Village.'
  },
  {
    link: '/r/shop/cinema',
    title: 'Cinema',
    description: 'Introduced in the Season of Two Embers - Part One. Reached via the Collaboration Room from Aviary Village.'
  },
  {
    link: '/r/shop/concert-hall',
    title: 'Concert Hall',
    description: 'Introduced in the Season of Duets. Accessed through Aviary Village.'
  },
  {
    link: '/r/shop/harmony',
    title: 'Harmony Hall',
    description: 'Introduced in the Season of Performance. Reached from Aviary Village, the Village of Dreams or the Village Theatre.'
  },
  {
    link: '/r/shop/nesting',
    title: 'Nesting Workshop',
    description: 'Introduced in the Season of Nesting. Accessed through Aviary Village.'
  },
  {
    link: '/r/shop/office',
    title: 'Secret Area',
    description: 'Only available with a certain cape or during some events. Accessed through the Vault of Knowledge.'
  },
  {
    link: '/r/shop/wonderland-cafe',
    title: 'Wonderland Cafe',
    description: 'Introduced during Days of Feast in 2024. Accessed through the Wonderland Cafe Corridor.'
  }
];

@Component({
  selector: 'app-atmos-shops',
  templateUrl: './atmos-shops.component.html',
  styleUrl: './atmos-shops.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosIapCardComponent, AtmosItemListComponent, AtmosShopQuickActionsComponent]
})
export class AtmosShopsComponent {
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
