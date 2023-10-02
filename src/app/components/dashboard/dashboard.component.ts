import { Component, OnInit } from '@angular/core';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IEventInstance } from 'src/app/interfaces/event.interface';
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
  ts?: ITravelingSpirit;
  eventInstance?: IEventInstance;

  constructor(
    private readonly _dataService: DataService
  ) {
  }

  ngOnInit(): void {
    this.season = this._dataService.seasonConfig.items.findLast(s => DateHelper.isActive(s.date, s.endDate));
    this.ts = this._dataService.travelingSpiritConfig.items.findLast<ITravelingSpirit>(t => DateHelper.isActive(t.date, t.endDate));

    for (const event of this._dataService.eventConfig.items) {
      const instance = event.instances?.findLast<IEventInstance>(i => DateHelper.isActive(i.date, i.endDate));
      if (!instance) { continue; }
      this.eventInstance = instance;
      break;
    }
  }
}
