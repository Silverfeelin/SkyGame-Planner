import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import { DateHelper } from '../helpers/date-helper';

@Pipe({
  name: 'dayjs'
})
export class DayjsPipe implements PipeTransform {
  transform(date: dayjs.Dayjs, format?: string): string {
    format ??= DateHelper.displayFormat;
    return date.format(format);
  }
}
