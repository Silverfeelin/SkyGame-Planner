import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { SubscriptionLike } from 'rxjs';
import { IEventInstance, IShop, IIAP } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { IAPService } from '@app/services/iap.service';
import { TitleService } from '@app/services/title.service';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DurationComponent } from '@app/components/util/duration/duration.component';
import { ItemListComponent } from '@app/components/item-list/item-list/item-list.component';
import { AtmosDraftWarningComponent, AtmosIapCardComponent, AtmosSpiritTreeComponent } from '@app/redesign/shared/atmos-shared-widgets';

@Component({
  selector: 'app-atmos-event-instance',
  templateUrl: './atmos-event-instance.component.html',
  styleUrl: './atmos-event-instance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatIcon,
    DateComponent,
    DaysLeftComponent,
    DurationComponent,
    AtmosSpiritTreeComponent,
    ItemListComponent,
    AtmosIapCardComponent,
    AtmosDraftWarningComponent
  ]
})
export class AtmosEventInstanceComponent implements OnDestroy {
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _iapService = inject(IAPService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);

  readonly instance = signal<IEventInstance | undefined>(undefined);
  readonly state = signal<'future' | 'active' | 'ended' | undefined>(undefined);
  readonly shops = signal<IShop[]>([]);
  readonly iapShops = signal<IShop[]>([]);
  readonly highlightItem = signal<string | undefined>(undefined);
  readonly highlightIap = signal<string | undefined>(undefined);
  readonly previousInstance = signal<IEventInstance | undefined>(undefined);
  readonly nextInstance = signal<IEventInstance | undefined>(undefined);

  readonly c = signal(0);
  readonly cLeft = signal(0);
  readonly ec = signal(0);
  readonly ecLeft = signal(0);

  private _itemSub?: SubscriptionLike;

  constructor() {
    this._route.queryParamMap.subscribe(p => this._onQuery(p));
    this._route.paramMap.subscribe(p => this._onParams(p));
    this._itemSub = this._eventService.itemToggled.subscribe(() => this._calculateCandles());
  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
  }

  togglePurchased(iap: IIAP): void { this._iapService.togglePurchased(iap); }
  toggleGifted(iap: IIAP): void { this._iapService.toggleGifted(iap); }

  private _onQuery(p: ParamMap): void {
    this.highlightItem.set(p.get('highlightItem') ?? undefined);
    this.highlightIap.set(p.get('highlightIap') ?? undefined);
  }

  private _onParams(params: ParamMap): void {
    const guid = params.get('guid');
    const instance = this._dataService.guidMap.get(guid!) as IEventInstance | undefined;
    if (!instance) { return; }
    this.instance.set(instance);
    this._titleService.setTitle(instance.event?.name ?? 'Event Instance');
    this.state.set(DateHelper.getStateFromPeriod(instance.date, instance.endDate));

    const shopsAll = instance.shops ?? [];
    const iapShops = shopsAll.filter(s => s.iaps?.length);
    // Sort iapShops by # of non-returning iaps (legacy parity)
    iapShops.sort((a, b) => {
      const aNew = a.iaps?.filter(i => !i.returning).length ?? 0;
      const bNew = b.iaps?.filter(i => !i.returning).length ?? 0;
      return bNew - aNew;
    });
    this.iapShops.set(iapShops);
    this.shops.set(shopsAll.filter(s => s.itemList));

    const idx = instance.event?.instances?.indexOf(instance) ?? -1;
    this.previousInstance.set(idx >= 0 ? instance.event!.instances![idx - 1] : undefined);
    this.nextInstance.set(idx >= 0 ? instance.event!.instances![idx + 1] : undefined);

    this._calculateCandles();
  }

  private _calculateCandles(): void {
    const instance = this.instance();
    if (!instance) { return; }
    let c = 0, cLeft = 0, ec = 0, ecLeft = 0;

    instance.spirits?.map(s => s.tree).forEach(tree => {
      if (!tree) { return; }
      TreeHelper.getNodes(tree).forEach(n => {
        c += n.c || 0;
        ec += n.ec || 0;
        if (!n.unlocked && !n.item?.unlocked) {
          cLeft += n.c || 0;
          ecLeft += n.ec || 0;
        }
      });
    });

    instance.shops?.filter(s => s.itemList?.items?.length).forEach(shop => {
      shop.itemList?.items.forEach(i => {
        c += i.c || 0;
        ec += i.ec || 0;
        if (i.item && !i.item.unlocked) {
          cLeft += i.c || 0;
          ecLeft += i.ec || 0;
        }
      });
    });

    this.c.set(c); this.cLeft.set(cLeft); this.ec.set(ec); this.ecLeft.set(ecLeft);
  }
}
