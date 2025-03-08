import { Component, OnInit } from '@angular/core';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { DataService } from 'src/app/services/data.service';
import { ReturningSpiritCardComponent } from '../returning-spirit-card/returning-spirit-card.component';
import { SpiritCardComponent } from '../spirit-card/spirit-card.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { SeasonCardComponent } from '../season-card/season-card.component';
import { DashboardWishlistComponent } from './dashboard-wishlist/dashboard-wishlist.component';
import { NgIf, NgFor } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { MatIcon } from '@angular/material/icon';
import { ClockComponent } from '../clock/clock.component';
import { CardComponent } from "../layout/card/card.component";
import { DailyCardComponent } from "../daily-card/daily-card.component";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less'],
    imports: [ClockComponent, MatIcon, SearchComponent, NgIf, DashboardWishlistComponent, SeasonCardComponent, NgFor, EventCardComponent, SpiritCardComponent, ReturningSpiritCardComponent, CardComponent, DailyCardComponent]
})
export class DashboardComponent implements OnInit {

  season?: ISeason;
  futureSeason?: ISeason;
  ts?: ITravelingSpirit;
  futureTs?: ITravelingSpirit;
  rs?: IReturningSpirits;
  futureRs?: IReturningSpirits;
  eventInstances: Array<IEventInstance> = [];
  futureEventInstance?: IEventInstance;

  constructor(
    private readonly _dataService: DataService
  ) { }

  ngOnInit(): void {
    // Season
    const seasonDates = DateHelper.groupByPeriod(this._dataService.seasonConfig.items);
    this.season = seasonDates.active?.at(-1);
    this.futureSeason = seasonDates.future?.at(-1);

    // TS
    const tsDates = DateHelper.groupByPeriod(this._dataService.travelingSpiritConfig.items);
    this.ts = tsDates.active?.at(-1);
    this.futureTs = tsDates.future?.at(-1);

    // RS
    const rsDates = DateHelper.groupByPeriod(this._dataService.returningSpiritsConfig.items);
    this.rs = rsDates.active?.at(-1);
    this.futureRs = rsDates.future?.at(-1);

    // Event
    this.eventInstances = [];
    const futureEvents = new Array<IEventInstance>();
    for (const event of this._dataService.eventConfig.items) {
      if (!event.instances) { continue; }
      const eventDates = DateHelper.groupByPeriod(event.instances);
      if (eventDates.active.length) {
        this.eventInstances.push(eventDates.active.at(-1)!);
      } else if (eventDates.future.length) {
        const e = eventDates.future.at(0)!;
        if (e.date.diffNow('days').days <= 21) {
          futureEvents.push(e);
        }
      }
    }
    futureEvents.sort((a, b) => a.date.diff(b.date).as('milliseconds'));
    this.futureEventInstance = futureEvents.at(0);
  }
}
