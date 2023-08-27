import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-realm',
  templateUrl: './realm.component.html',
  styleUrls: ['./realm.component.less']
})
export class RealmComponent {
  realm!: IRealm;

  highlightTree?: string;

  spirits: Array<ISpirit> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(p => this.onQueryChanged(p));
    _route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  onQueryChanged(params: ParamMap): void {
    this.highlightTree = params.get('highlightTree') || undefined;
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.initializeRealm(guid!);
  }

  private initializeRealm(guid: string): void {
    this.realm = this._dataService.guidMap.get(guid!) as IRealm;

    this.spirits = [];
    this.realm?.areas?.forEach(area => {
      area.spirits?.filter(s => s.type === 'Regular' || s.type === 'Elder').forEach(spirit => {
        this.spirits.push(spirit);
      });
    });
  }
}
