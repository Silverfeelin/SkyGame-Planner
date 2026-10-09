import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from '../helpers/date-helper';

@Pipe({
    name: 'time',
    standalone: true
})
export class TimePipe implements PipeTransform {
  transform(date: DateTime, seconds = false): string {
    return DateHelper.formatTime(date, seconds);
  }
}
