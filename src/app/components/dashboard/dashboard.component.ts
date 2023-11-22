import { Component, OnInit } from '@angular/core';
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
  ts?: ITravelingSpirit;
  rs?: IReturningSpirits;
  eventInstance?: IEventInstance;

  constructor(
    private readonly _dataService: DataService
  ) {
  }

  ngOnInit(): void {
    this.season = DateHelper.getActive(this._dataService.seasonConfig.items) ?? DateHelper.getUpcoming(this._dataService.seasonConfig.items);
    this.ts = DateHelper.getActive(this._dataService.travelingSpiritConfig.items) ?? DateHelper.getUpcoming(this._dataService.travelingSpiritConfig.items);
    this.rs = DateHelper.getActive(this._dataService.returningSpiritsConfig.items) ?? DateHelper.getUpcoming(this._dataService.returningSpiritsConfig.items);

    for (const event of this._dataService.eventConfig.items) {
      if (!event.instances) { continue; }
      this.eventInstance = DateHelper.getActive(event.instances);
      if (this.eventInstance) { break; }
    }
  }
}
