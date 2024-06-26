import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { DateHelper } from 'src/app/helpers/date-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { ICost } from 'src/app/interfaces/cost.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { EventService } from 'src/app/services/event.service';
import { CostComponent } from '../util/cost/cost.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { DiscordLinkComponent } from "../util/discord-link/discord-link.component";

type Section = 'img' | 'overview' | 'date' | 'spirits' | 'cost' | 'dailies' | 'checkin' | 'calculator';
export interface SeasonCardOptions {
  show?: Array<Section>;
}

@Component({
    selector: 'app-season-card',
    templateUrl: './season-card.component.html',
    styleUrls: ['./season-card.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, RouterLink, MatIcon, DateComponent, DaysLeftComponent, CostComponent, DiscordLinkComponent]
})
export class SeasonCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() season?: ISeason;
  @Input() options: SeasonCardOptions = { show: [ 'img', 'overview', 'spirits' ] };

  sections: {[key: string]: number} = {};
  cost?: ICost;
  remainingCost?: ICost;
  checkedIn = false;
  imageUrlSafe?: string;

  _subs = new SubscriptionBag();

  constructor(
    private readonly _eventService: EventService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(this._eventService.storageChanged.pipe(filter(e => e.key?.startsWith('season.checkin.') == true)).subscribe(e => {
      this.updateCheckin();
    }));
  }

  ngOnInit(): void {
    this.updateSections();
    this.updateSeason();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) { this.updateSections();}
    if (changes['season']) { this.updateSeason(); }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private updateSeason(): void {
    this.cost = this.remainingCost = undefined;
    if (!this.season) { return; }
    const nodes = this.season.spirits.map(s => NodeHelper.all(s.tree?.node)).flat();
    this.cost = CostHelper.add(CostHelper.create(), ...nodes);

    const locked = nodes.filter(n => !n.unlocked && !n.item?.unlocked);
    this.remainingCost = CostHelper.add(CostHelper.create(), ...locked);

    this.imageUrlSafe = this.season.imageUrl ? `url('${this.season.imageUrl}')` : undefined;

    this.updateCheckin();
  }

  checkin(): void {
    this.checkedIn = !this.checkedIn;
    this.updateCalculator();
    if (this.checkedIn) {
      localStorage.setItem(`season.checkin.${this.season?.guid}`, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(`season.checkin.${this.season?.guid}`);
    }
  }

  /** Update checked in status from storage. */
  private updateCheckin(): void {
    if (!this.season) { return; }
    const checkinDate = localStorage.getItem(`season.checkin.${this.season.guid}`);
    if (checkinDate) {
      const d = DateTime.fromFormat(checkinDate, 'yyyy-MM-dd', { zone: DateHelper.skyTimeZone });
      this.checkedIn = d.hasSame(DateTime.now().setZone(DateHelper.skyTimeZone), 'day');
    } else {
      this.checkedIn = false;
    }

    this._changeDetectorRef.markForCheck();
  }

  private updateSections(): void {
    this.sections = {};
    this.options.show?.forEach((section, i) => {
      this.sections[section] = i + 2;
    });
  }

  /** Update calculator candles. */
  private updateCalculator(): void {
    if (!this.season) { return; }

    // Get data
    const calcData = localStorage.getItem(`season.calc.${this.season.guid}`);
    if (!calcData) { return; }
    const data = JSON.parse(calcData);

    const today = DateHelper.todaySky().toISO();
    const c = data.sp ? 6 : 5; // Amount of daily candles.

    if (this.checkedIn) {
      // If checked only modify if calculator includes today's candles.
      if (data.it === today) { return; }
      data.it = today;
      data.sc = Math.min(data.sc + c, 999);
    } else {
      // If unchecked only modify if calculator doesn't includes today's candles.
      if (!data.it || data.it !== today) { return; }
      data.it = '';
      data.sc = Math.max(data.sc - c, 0);
    }

    localStorage.setItem(`season.calc.${this.season.guid}`, JSON.stringify(data));
  }
}
