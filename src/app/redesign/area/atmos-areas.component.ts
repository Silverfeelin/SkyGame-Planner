import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { IArea, IRealm } from 'skygame-data';
import { AtmosRealmQuickActionsComponent } from '../realm/quick-actions/atmos-realm-quick-actions.component';

@Component({
  selector: 'app-atmos-areas',
  templateUrl: './atmos-areas.component.html',
  styleUrl: './atmos-areas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosRealmQuickActionsComponent]
})
export class AtmosAreasComponent {
  readonly realm = signal<IRealm | undefined>(undefined);
  readonly areas = signal<ReadonlyArray<IArea>>([]);

  constructor(
    private readonly _dataService: DataService,
    route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(p => this.onQueryChanged(p));
  }

  private onQueryChanged(params: ParamMap): void {
    const realmGuid = params.get('realm');
    const realm = realmGuid ? this._dataService.guidMap.get(realmGuid) as IRealm : undefined;
    this.realm.set(realm);
    this.areas.set(realm?.areas ?? this._dataService.areaConfig.items);
  }
}
