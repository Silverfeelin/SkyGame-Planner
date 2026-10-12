import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DateTime } from 'luxon';
import { DateComponent } from '../date/date.component';

/**
 * Start → end date range, rendered in the compact `17 Jul → 01 Oct` form used
 * across the atmospheric cards and overview pages. The format is deliberately
 * fixed (rather than following the `date.format` setting) so ranges stay short
 * enough to sit on one line beside their icon.
 */
@Component({
  selector: 'app-date-range',
  template: `<app-date [date]="start()" [format]="format" /> → <app-date [date]="end()" [format]="format" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateComponent]
})
export class DateRangeComponent {
  readonly start = input<DateTime | string | undefined>(undefined);
  readonly end = input<DateTime | string | undefined>(undefined);

  readonly format = 'dd LLL';
}
