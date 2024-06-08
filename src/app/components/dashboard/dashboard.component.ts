import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IEventInstance } from 'src/app/interfaces/event.interface';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ITravelingSpirit } from 'src/app/interfaces/traveling-spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
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

  // Sky Wiki 5 year survey. Can be removed after 2024-07-09
  wikiBannerAvailable = DateTime.now().toUTC() >= DateTime.fromISO('2024-06-09T00:00:00Z') && DateTime.now().toUTC() < DateTime.fromISO('2024-07-09T00:00:00Z');
  wikiBannerDismissed = localStorage.getItem('dashboard.wiki5yr') === 'dismissed';

  constructor(
    private readonly _dataService: DataService
  ) {
  }

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
        if (e.date.diffNow('days').days <= 7) {
          futureEvents.push(e);
        }
      }
    }
    futureEvents.sort((a, b) => a.date.diff(b.date).as('milliseconds'));
    this.futureEventInstance = futureEvents.at(0);
  }

  dismissWikiBanner(): void {
    this.wikiBannerDismissed = true;
    localStorage.setItem('dashboard.wiki5yr', 'dismissed')
  }
}
