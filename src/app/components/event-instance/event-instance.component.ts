import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { SubscriptionLike } from 'rxjs';
import { DateHelper } from 'src/app/helpers/date-helper';
import { DataService } from 'src/app/services/data.service';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { IAPService } from 'src/app/services/iap.service';
import { TitleService } from 'src/app/services/title.service';
import { ItemListComponent } from '../item-list/item-list/item-list.component';
import { SpiritTreeComponent } from '../spirit-tree/spirit-tree.component';
import { DurationComponent } from '../util/duration/duration.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { DateComponent } from '../util/date/date.component';
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";
import { IapCardComponent } from "../iap/iap-card/iap-card.component";
import { TreeHelper } from '@app/helpers/tree-helper';
import { IEventInstance, IShop, IIAP } from 'skygame-data';

@Component({
    selector: 'app-event-instance',
    templateUrl: './event-instance.component.html',
    styleUrls: ['./event-instance.component.less'],
    imports: [DateComponent, WikiLinkComponent, NgIf, RouterLink, MatIcon, DaysLeftComponent, DurationComponent, NgFor, SpiritTreeComponent, ItemListComponent, CalendarLinkComponent, IapCardComponent]
})
export class EventInstanceComponent implements OnDestroy {
  instance!: IEventInstance;
  state: 'future' | 'active' | 'ended' | undefined;
  shops?: Array<IShop>;
  iapShops?: Array<IShop>;
  highlightItem?: string;
  highlightIap?: string;

  previousInstance?: IEventInstance;
  nextInstance?: IEventInstance;

  c: number = 0;
  cLeft: number = 0;
  ec: number = 0;
  ecLeft: number = 0;

  private _itemSub?: SubscriptionLike;

  constructor(
    private readonly _dataService: DataService,
    private readonly _debugService: DebugService,
    private readonly _eventService: EventService,
    private readonly _iapService: IAPService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
    this.subscribeItemChanged();
  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
  }

  subscribeItemChanged(): void {
    this._itemSub?.unsubscribe();
    this._itemSub = this._eventService.itemToggled
      .subscribe(v => this.onItemChanged());
  }

  onItemChanged(): void {
    this.calculateCandles();
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightItem = p.get('highlightItem') || undefined;
    this.highlightIap = p.get('highlightIap') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.instance = this._dataService.guidMap.get(guid!) as IEventInstance;
    this._titleService.setTitle(this.instance.event?.name ?? 'Event Instance');

    this.state = DateHelper.getStateFromPeriod(this.instance.date, this.instance.endDate);

    const shops = this.instance.shops ?? [];
    this.iapShops = shops.filter(s => s.iaps?.length);
    this.shops = shops.filter(s => s.itemList);

    const iInstance = this.instance.event?.instances?.indexOf(this.instance) ?? -1;
    this.previousInstance = iInstance >= 0 ? this.instance.event!.instances![iInstance - 1] : undefined;
    this.nextInstance = iInstance >= 0 ? this.instance.event!.instances![iInstance + 1] : undefined;

    // Sort shops to prioritize ones with new items.
    this.iapShops?.sort((a, b) => {
      const aNew = a.iaps?.filter(iap => !iap.returning).length ?? 0;
      const bNew = b.iaps?.filter(iap => !iap.returning).length ?? 0;
      return bNew - aNew;
    });

    this.calculateCandles();
    this._changeDetectorRef.markForCheck();
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    if (this._debugService.copyShop) {
      event.stopImmediatePropagation();
      event.preventDefault();
      navigator.clipboard.writeText(iap.shop?.guid ?? '');
      return;
    }

    this._iapService.togglePurchased(iap);
  }

  calculateCandles(): void {
    this.c = this.cLeft = this.ec = this.ecLeft = 0;

    this.instance.spirits?.map(s => s.tree).forEach(tree => {
      if (!tree) { return; }
      TreeHelper.getNodes(tree).forEach(n => {
        this.c += n.c || 0;
        this.ec += n.ec || 0;
        if (!n.unlocked && !n.item?.unlocked) {
          this.cLeft += n.c || 0;
          this.ecLeft += n.ec || 0;
        }
      });
    });

    this.instance.shops?.filter(s => s.itemList?.items?.length).forEach(shop => {
      shop.itemList?.items.forEach(i => {
        this.c += i.c || 0;
        this.ec += i.ec || 0;
        if (i.item && !i.item.unlocked) {
          this.cLeft += i.c || 0;
          this.ecLeft += i.ec || 0;
        }
      });
    });
  }

}
