import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'dayjs'
})
export class DayjsPipe implements PipeTransform {
  transform(date: dayjs.Dayjs, format: string): string {
    return date.format(format);
  }
}
