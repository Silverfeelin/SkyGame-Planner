import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IReturningSpirits } from 'src/app/interfaces/returning-spirits.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-returning-spirit',
  templateUrl: './returning-spirit.component.html',
  styleUrls: ['./returning-spirit.component.less']
})
export class ReturningSpiritComponent {
  rs!: IReturningSpirits;

  constructor(
    private readonly _dataService: DataService,
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
  }
}
