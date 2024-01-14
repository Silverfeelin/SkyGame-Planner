import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';

@Component({
  selector: 'app-days-left',
  templateUrl: './days-left.component.html',
  styleUrls: ['./days-left.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaysLeftComponent implements OnChanges {
  @Input() date?: DateTime;
  @Input() start?: DateTime;
  @Input() end?: DateTime;

  label: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.label = this.getLabel();
  }

  private getLabel(): string {
    const date = this.date ?? DateTime.now();
    if (this.start && date < this.start) { return this.getLabelBeforeStart(date); }
    if (this.start && !this.end) { return 'ongoing'; }
    if (this.end && date < this.end) { return this.getLabelBeforeEnd(date); }
    if (this.end) return 'ended';
    return '';
  }

  private getLabelBeforeStart(date: DateTime): string {
    const days = DateHelper.daysBetween(date, this.start!);
    if (!days) { return 'tomorrow'; }
    return `in ${days + 1} days`;
  }

  private getLabelBeforeEnd(date: DateTime): string {
    const days = DateHelper.daysBetween(date, this.end!);
    if (!days) { return 'last day'; }
    return `${days + 1} days left`;
  }
}
