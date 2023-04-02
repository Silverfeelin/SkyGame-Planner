import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ISeason } from 'src/app/interfaces/season.interface';
import { ISpirit, SpiritType } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.less']
})
export class SeasonComponent {
  season!: ISeason;

  guide?: ISpirit;
  spirits: Array<ISpirit> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.season = this._dataService.guidMap.get(guid!) as ISeason;

    this.guide = undefined;
    this.spirits = [];
    this.season?.spirits?.forEach(spirit => {
      switch (spirit.type) {
        case 'Guide':
          this.guide = spirit;
          break;
        case 'Season':
          this.spirits.push(spirit);
          break;
      }
    });
  }
}
