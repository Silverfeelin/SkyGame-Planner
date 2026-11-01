import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { TranslationService } from '@app/services/translation.service';
import { IArea } from 'skygame-data';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { FeatureCardComponent, IFeatureLink } from '../dashboard/feature-card.component';
import { TranslatePipe } from '@app/pipes/translate.pipe';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionQuickActionsComponent, FeatureCardComponent, TranslatePipe]
})
export class AreasComponent {
  private readonly _dataService = inject(DataService);
  private readonly _translationService = inject(TranslationService);
  readonly areas: ReadonlyArray<IArea> = this._dataService.areaConfig.items;

  areaLinks(area: IArea): ReadonlyArray<IFeatureLink> {
    const links: IFeatureLink[] = [
      { icon: 'dashboard', label: this._translationService.getNested('AREA_DETAIL.OVERVIEW') || 'Overview', link: `/area/${area.guid}` }
    ];
    if (area.realm) {
      links.push({ icon: 'map', label: area.realm.name, link: `/realm/${area.realm.guid}` });
    }
    if (area.mapData?.position) {
      links.push({ icon: 'location_on', label: this._translationService.getNested('AREA_DETAIL.VIEW_ON_MAP') || 'View on map', link: '/realm', queryParams: { map: '3', area: area.guid } });
    }
    return links;
  }
}
