import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { IArea } from 'skygame-data';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { FeatureCardComponent, IFeatureLink } from '../dashboard/feature-card.component';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionQuickActionsComponent, FeatureCardComponent]
})
export class AreasComponent {
  readonly areas: ReadonlyArray<IArea> = inject(DataService).areaConfig.items;

  areaLinks(area: IArea): ReadonlyArray<IFeatureLink> {
    const links: IFeatureLink[] = [
      { icon: 'dashboard', label: 'Overview', link: `/area/${area.guid}` }
    ];
    if (area.realm) {
      links.push({ icon: 'map', label: area.realm.name, link: `/realm/${area.realm.guid}` });
    }
    if (area.mapData?.position) {
      links.push({ icon: 'location_on', label: 'View on map', link: '/realm', queryParams: { map: '3', area: area.guid } });
    }
    return links;
  }
}
