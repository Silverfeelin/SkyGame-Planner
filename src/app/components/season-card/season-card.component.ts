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
import { StorageService } from '@app/services/storage.service';
import { CurrencyService } from '@app/services/currency.service';

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
    private readonly _currencyService: CurrencyService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
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

  checkin(evt: MouseEvent): void {
    this.checkedIn = !this.checkedIn;
    if (this.checkedIn) {
      localStorage.setItem(`season.checkin.${this.season?.guid}`, DateTime.local({ zone: DateHelper.skyTimeZone }).toFormat('yyyy-MM-dd'));
    } else {
      localStorage.removeItem(`season.checkin.${this.season?.guid}`);
    }

    let dailyCurrency = this._storageService.hasSeasonPass(this.season!.guid) ? 6 : 5;
    if (!this.checkedIn) { dailyCurrency = -dailyCurrency; }
    this._currencyService.addSeasonCurrency(this.season!.guid, dailyCurrency, 0);
    this._currencyService.animateCurrencyGained(evt, dailyCurrency);
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
}
