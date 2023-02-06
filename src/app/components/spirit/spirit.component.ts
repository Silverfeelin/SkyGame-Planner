import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-spirit',
  templateUrl: './spirit.component.html',
  styleUrls: ['./spirit.component.less']
})
export class SpiritComponent {
  spirit?: ISpirit;

  highlightTree?: string;

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(p: ParamMap): void {
    this.highlightTree = p.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.spirit = guid ? this._dataService.guidMap.get(guid) as ISpirit : undefined;
  }
}
