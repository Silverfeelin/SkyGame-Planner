import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { IArea } from 'skygame-data';
import { AtmosRealmQuickActionsComponent } from '../realm/quick-actions/atmos-realm-quick-actions.component';
import { AtmosFeatureCardComponent, IFeatureLink } from '../dashboard/atmos-feature-card.component';

@Component({
  selector: 'app-atmos-areas',
  templateUrl: './atmos-areas.component.html',
  styleUrl: './atmos-areas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosRealmQuickActionsComponent, AtmosFeatureCardComponent]
})
export class AtmosAreasComponent {
  readonly areas: ReadonlyArray<IArea> = inject(DataService).areaConfig.items;

  areaLinks(area: IArea): ReadonlyArray<IFeatureLink> {
    const links: IFeatureLink[] = [];
    if (area.realm) {
      links.push({ icon: 'map', label: area.realm.name, link: `/realm/${area.realm.guid}` });
    }
    if (area.mapData?.position) {
      links.push({ icon: 'location_on', label: 'View on map', link: '/realm', queryParams: { map: '3', area: area.guid } });
    }
    return links;
  }
}
