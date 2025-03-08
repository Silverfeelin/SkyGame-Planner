import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DateHelper } from 'src/app/helpers/date-helper';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { DataService } from 'src/app/services/data.service';
import { TitleService } from 'src/app/services/title.service';
import { SpiritTreeComponent } from '../spirit-tree/spirit-tree.component';
import { DurationComponent } from '../util/duration/duration.component';
import { DaysLeftComponent } from '../util/days-left/days-left.component';
import { NgIf, NgFor } from '@angular/common';
import { DateComponent } from '../util/date/date.component';
import { MatIcon } from '@angular/material/icon';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from "../util/calendar-link/calendar-link.component";

@Component({
    selector: 'app-returning-spirit',
    templateUrl: './returning-spirit.component.html',
    styleUrls: ['./returning-spirit.component.less'],
    imports: [WikiLinkComponent, MatIcon, DateComponent, NgIf, DaysLeftComponent, DurationComponent, RouterLink, NgFor, SpiritTreeComponent, CalendarLinkComponent]
})
export class ReturningSpiritComponent {
  rs!: IReturningSpirits;

  state: 'future' | 'active' | 'ended' | undefined;

  constructor(
    private readonly _dataService: DataService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(params: ParamMap): void {
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeRs(guid!);
  }

  private initializeRs(guid: string): void {
    this.rs = this._dataService.guidMap.get(guid!) as IReturningSpirits;
    this._titleService.setTitle(this.rs.name || 'Special Visit');
    this.state = DateHelper.getStateFromPeriod(this.rs.date, this.rs.endDate);
  }
}
