import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { WikiLinkComponent } from '../util/wiki-link/wiki-link.component';
import { IRealm, IArea } from 'skygame-data';

@Component({
    selector: 'app-areas',
    imports: [WikiLinkComponent, RouterLink, MatIcon],
    templateUrl: './areas.component.html',
    styleUrl: './areas.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreasComponent {
  realm?: IRealm;
  areas?: Array<IArea>

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute,
  ) {
    _route.queryParamMap.subscribe(params => {
      this.onQueryChanged(params);
    });
  }

  onQueryChanged(params: ParamMap): void {
    const realmGuid = params.get('realm');
    this.realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;

    if (this.realm) {
      this.areas = this.realm.areas;
    } else {
      this.areas = this._dataService.areaConfig.items;
    }
  }
}
