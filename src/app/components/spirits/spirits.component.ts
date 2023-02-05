import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-spirits',
  templateUrl: './spirits.component.html',
  styleUrls: ['./spirits.component.less']
})
export class SpiritsComponent {
  spirits: Array<ISpirit> = [];
  rows: Array<any> = [];

  /**
   *
   */
  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute
  ) {
    _route.queryParamMap.subscribe(q => { this.onQueryChanged(q); });
  }

  onQueryChanged(q: ParamMap): void {
    this.spirits = [];

    // Load all from realm
    const realmGuid = q.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;
    realm?.areas?.forEach(a => a.spirits?.filter(s => !s.season).forEach(s => this.spirits.push(s)));

    // Filter by type
    const type = q.get('type');
    if (type) { this.spirits = this.spirits.filter(s => s.type === type); }

    this.initTable();
  }

  initTable(): void {
    this.rows = this.spirits.map(s => s.name);
  }
}
