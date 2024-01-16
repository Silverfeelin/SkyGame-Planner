import { Pipe, PipeTransform } from '@angular/core';
import { DateHelper } from '../helpers/date-helper';
import { DateTime } from 'luxon';

@Pipe({
  name: 'datetime'
})
export class DateTimePipe implements PipeTransform {
  transform(date: DateTime, format?: string): string {
    format ??= DateHelper.displayFormat;
    return date.toFormat(format);
  }
}
