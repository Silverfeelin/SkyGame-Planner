import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import dayjs from 'dayjs';
import { DateHelper } from 'src/app/helpers/date-helper';

@Component({
  selector: 'app-days-left',
  templateUrl: './days-left.component.html',
  styleUrls: ['./days-left.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaysLeftComponent implements OnChanges {
  @Input() date?: dayjs.Dayjs;
  @Input() start?: dayjs.Dayjs;
  @Input() end?: dayjs.Dayjs;

  label: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.label = this.getLabel();
  }

  private getLabel(): string {
    const date = this.date ?? dayjs();
    if (this.start && date.isBefore(this.start)) { return this.getLabelBeforeStart(date); }
    if (this.start && !this.end) { return 'ongoing'; }
    if (this.end && date.isBefore(this.end)) { return this.getLabelBeforeEnd(date); }
    if (this.end) return 'ended';
    return '';
  }

  private getLabelBeforeStart(date: dayjs.Dayjs): string {
    const days = DateHelper.daysBetween(date, this.start!);
    if (!days) { return 'tomorrow'; }
    return `in ${days + 1} days`;
  }

  private getLabelBeforeEnd(date: dayjs.Dayjs): string {
    const days = DateHelper.daysBetween(date, this.end!);
    if (!days) { return 'last day'; }
    return `${days + 1} days left`;
  }
}
