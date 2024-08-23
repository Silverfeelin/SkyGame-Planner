import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IEvent, IEventInstance } from 'src/app/interfaces/event.interface';
import { EventService } from 'src/app/services/event.service';
import { CostComponent } from '../util/cost/cost.component';
import { RouterLink } from '@angular/router';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { DiscordLinkComponent } from "../util/discord-link/discord-link.component";
import { CurrencyService } from '@app/services/currency.service';

type Section = 'img' | 'date' | 'overview' | 'list' | 'recent' | 'upcoming' | 'cost' | 'dailies' | 'checkin' | 'calculator';
export interface EventCardOptions {
  show?: Array<Section>;
}

@Component({
    selector: 'app-event-card',
    templateUrl: './event-card.component.html',
    styleUrls: ['./event-card.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIcon, DateComponent, DaysLeftComponent, RouterLink, CostComponent, DiscordLinkComponent]
})
export class EventCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() event?: IEvent;
  @Input() instance?: IEventInstance;
  @Input() options: EventCardOptions = { show: ['img', 'list', 'recent']};

  sections: {[key: string]: number} = {};
  lastInstance?: IEventInstance;
  nextInstance?: IEventInstance;
  cost?: ICost;
  remainingCost?: ICost;
  checkedIn = false;
  imageUrlSafe?: string;

  _subs = new SubscriptionBag();

  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _eventService: EventService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(this._eventService.storageChanged.pipe(filter(e => e.key?.startsWith('event.checkin.') == true)).subscribe(e => {
      this.updateCheckin();
    }));
  }

  ngOnInit(): void {
    this.updateSections();
    this.updateEvent();
    this.updateInstance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) { this.updateSections(); }
    if (changes['event']) { this.updateEvent(); }
    if (changes['instance']) { this.updateInstance(); }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  checkin(evt: MouseEvent): void {
    this.checkedIn = !this.checkedIn;
    if (this.checkedIn) {
      localStorage.setItem(`event.checkin.${this.event!.guid}`, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(`event.checkin.${this.event!.guid}`);
    }

    let dailyCurrency = this.instance?.calculatorData?.dailyCurrencyAmount || 0;
    if (dailyCurrency) {
      if (!this.checkedIn) { dailyCurrency = -dailyCurrency; }
      this._currencyService.addEventCurrency(this.instance!.guid, dailyCurrency);
      this._currencyService.animateCurrencyGained(evt, dailyCurrency);
    }
  }

  private updateEvent(): void {
    // Find last instance based on event.date.
    if (this.event?.instances) {
      const now = DateTime.now();
      this.lastInstance = DateHelper.getActive(this.event.instances) ?? this.event.instances.findLast(i => i.date < now);
      this.nextInstance = DateHelper.getUpcoming(this.event.instances);
    }

    this.imageUrlSafe = this.event?.imageUrl ? `url('${this.event.imageUrl}')` : undefined;

    this.updateCheckin();
  }

  /** Update checked in status from storage. */
  private updateCheckin(): void {
    const checkinDate = localStorage.getItem(`event.checkin.${this.event?.guid}`);
    if (checkinDate) {
      const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
      this.checkedIn = d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
    } else {
      this.checkedIn = false;
    }
    this._changeDetectorRef.markForCheck();
  }

  private updateInstance(): void {
    this.cost = this.remainingCost = undefined;

    if (!this.instance) { return; }
    const nodes = this.instance.spirits.map(s => NodeHelper.all(s.tree?.node)).flat();
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);

    this.instance.shops?.filter(s => s.itemList?.items?.length).forEach(s => {
      CostHelper.add(this.cost!, ...s.itemList!.items);
      const locked = s.itemList!.items.filter(i => !i.unlocked);
      CostHelper.add(this.remainingCost!, ...locked);
    });
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }
}
