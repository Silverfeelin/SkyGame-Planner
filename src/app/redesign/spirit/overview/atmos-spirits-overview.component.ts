import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { SpiritType } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';

interface IOverviewLink {
  readonly label: string;
  readonly route: string;
  readonly queryParams?: Record<string, string>;
  readonly icon?: string;
  readonly type?: SpiritType;
  readonly count?: number;
}

/**
 * Atmospheric spirits overview / index — renders a tile grid that links to
 * each sub-section of the spirit area (regular, elder, season, guide, TS, RS,
 * elusive). Mirrors legacy `SpiritsOverviewComponent`.
 */
@Component({
  selector: 'app-atmos-spirits-overview',
  templateUrl: './atmos-spirits-overview.component.html',
  styleUrl: './atmos-spirits-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, SpiritTypeIconComponent]
})
export class AtmosSpiritsOverviewComponent {
  private readonly _data = inject(DataService);

  readonly links: ReadonlyArray<IOverviewLink>;

  constructor() {
    const counts = this._data.spiritConfig.items.reduce((c, s) => {
      c[s.type] = (c[s.type] || 0) + 1;
      return c;
    }, {} as Record<SpiritType, number>);

    this.links = [
      { label: 'Regular Spirits', route: '/r/spirit', queryParams: { type: 'Regular' }, type: 'Regular', count: counts['Regular'] },
      { label: 'Elder Spirits',   route: '/r/spirit', queryParams: { type: 'Elder' },   type: 'Elder',   count: counts['Elder'] },
      { label: 'Season Spirits',  route: '/r/spirit', queryParams: { type: 'Season' },  type: 'Season',  count: counts['Season'] },
      { label: 'Season Guides',   route: '/r/spirit', queryParams: { type: 'Guide' },   type: 'Guide',   count: counts['Guide'] },
      { label: 'Traveling Spirits', route: '/r/ts', icon: 'hikings', count: this._data.travelingSpiritConfig.items.length },
      { label: 'Special Visits',  route: '/r/rs',   icon: 'flight',  count: this._data.returningSpiritsConfig.items.length },
      { label: 'Elusive Spirits', route: '/r/spirit/elusive', icon: 'timer' }
    ];
  }
}
