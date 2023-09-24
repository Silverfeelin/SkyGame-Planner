import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import dayjs from 'dayjs';
import { DateHelper } from 'src/app/helpers/date-helper';

@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DurationComponent implements OnChanges {
  @Input() start?: dayjs.Dayjs;
  @Input() end?: dayjs.Dayjs;

  label: string = '';

  ngOnChanges(): void {
    this.label = this.getLabel();
  }

  private getLabel(): string {
    if (!this.start || !this.end) { return ''; }
    const days = DateHelper.daysBetween(this.start, this.end);
    if (!days) { return '1 day'; }
    return `${days + 1} days`;
  }
}
