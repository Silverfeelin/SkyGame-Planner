import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';

@Component({
    selector: 'app-duration',
    templateUrl: './duration.component.html',
    styleUrls: ['./duration.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class DurationComponent implements OnChanges {
  @Input() start?: DateTime;
  @Input() end?: DateTime;

  label: string = '';

  ngOnChanges(): void {
    this.label = this.getLabel();
  }

  private getLabel(): string {
    if (!this.start || !this.end) { return ''; }
    let days = DateHelper.daysBetween(this.start, this.end);
    if (days === 1) { return '1 day'; }
    return `${days} days`;
  }
}
