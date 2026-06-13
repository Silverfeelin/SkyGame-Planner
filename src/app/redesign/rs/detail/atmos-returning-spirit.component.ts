import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpecialVisit } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { DateHelper } from '@app/helpers/date-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from '@app/components/util/calendar-link/calendar-link.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DurationComponent } from '@app/components/util/duration/duration.component';
import { AtmosDraftWarningComponent, AtmosSpiritTreeComponent } from '@app/redesign/shared/atmos-shared-widgets';

/**
 * Atmospheric returning-spirit (Special Visit) detail. Port of legacy
 * `ReturningSpiritComponent`. Renders the visit metadata + each spirit's tree.
 */
@Component({
  selector: 'app-atmos-returning-spirit',
  templateUrl: './atmos-returning-spirit.component.html',
  styleUrl: './atmos-returning-spirit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    WikiLinkComponent, CalendarLinkComponent,
    DateComponent, DaysLeftComponent, DurationComponent,
    AtmosSpiritTreeComponent, AtmosDraftWarningComponent
  ]
})
export class AtmosReturningSpiritComponent {
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _route = inject(ActivatedRoute);

  readonly rs = signal<ISpecialVisit | undefined>(undefined);

  readonly state = computed<'future' | 'active' | 'ended' | undefined>(() => {
    const r = this.rs();
    return r ? DateHelper.getStateFromPeriod(r.date, r.endDate) : undefined;
  });

  constructor() {
    this._route.paramMap.subscribe(p => this.onParamsChanged(p));
  }

  private onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    const rs = this._dataService.guidMap.get(guid!) as ISpecialVisit | undefined;
    this.rs.set(rs);
    if (rs) { this._titleService.setTitle(rs.name || 'Special Visit'); }
  }
}
