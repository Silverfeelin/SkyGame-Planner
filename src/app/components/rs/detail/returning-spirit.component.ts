import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpecialVisit } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { DateHelper } from '@app/helpers/date-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { CalendarLinkComponent } from '@app/components/util/calendar-link/calendar-link.component';
import { DateRangeComponent } from '@app/components/util/date-range/date-range.component';
import { DaysLeftComponent } from '@app/components/util/days-left/days-left.component';
import { DurationComponent } from '@app/components/util/duration/duration.component';
import { DraftWarningComponent, SpiritTreeComponent } from '@app/components/shared/shared-widgets';
import { SpiritQuickActionsComponent } from '@app/components/spirit/quick-actions/spirit-quick-actions.component';

/**
 * Returning-spirit (Special Visit) detail. Renders the visit metadata + each
 * spirit's tree.
 */
@Component({
  selector: 'app-returning-spirit',
  templateUrl: './returning-spirit.component.html',
  styleUrl: './returning-spirit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon,
    WikiLinkComponent, CalendarLinkComponent,
    DateRangeComponent, DaysLeftComponent, DurationComponent,
    SpiritTreeComponent, DraftWarningComponent,
    SpiritQuickActionsComponent
  ]
})
export class ReturningSpiritComponent {
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
