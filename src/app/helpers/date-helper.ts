import dayjs from 'dayjs';
import { IDate } from "../interfaces/date.interface";
import { IPeriod } from '../interfaces/base.interface';

export class DateHelper {
  static readonly skyTimeZone = 'America/Los_Angeles';
  static displayFormat: string;
  static displayFormats: Array<string> = [
    'DD-MM-YYYY',
    'DD/MM/YYYY',
    'MM-DD-YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'YYYY/MM/DD'
  ];

  static isActive(start: dayjs.Dayjs, end: dayjs.Dayjs): boolean {
    const now = dayjs();
    const s = dayjs.tz(start);
    const e = dayjs.tz(end);

    return now.isAfter(s) && now.isBefore(e);
  }

  static fromInterfaceLocal(date: IDate | dayjs.Dayjs): dayjs.Dayjs | undefined {
    if (!date) { return; }
    if (dayjs.isDayjs(date)) { return date; }
    return dayjs(`${date.year}-${date.month}-${date.day}`);
  }

  static fromInterfaceSky(date: IDate | dayjs.Dayjs): dayjs.Dayjs | undefined {
    if (!date) { return; }
    if (dayjs.isDayjs(date)) { return date; }
    return dayjs.tz(`${date.year}-${date.month}-${date.day}`);
  }

  static fromStringLocal(date: string | dayjs.Dayjs): dayjs.Dayjs | undefined {
    if (!date) { return; }
    if (dayjs.isDayjs(date)) { return date; }
    return dayjs(date);
  }

  static fromStringSky(date: string | dayjs.Dayjs): dayjs.Dayjs | undefined {
    if (!date) { return; }
    if (dayjs.isDayjs(date)) { return date; }
    return dayjs.tz(date);
  }

  /** Returns the days between two dates, rounded down. */
  static daysBetween(a: dayjs.Dayjs, b: dayjs.Dayjs): number {
    const hours = Math.abs(a.diff(b, 'hour'));
    return Math.floor(hours / 24);
  }

  static getStateFromPeriod(start: dayjs.Dayjs, end: dayjs.Dayjs, date?: dayjs.Dayjs): 'future' | 'active' | 'ended' {
    date ??= dayjs();
    if (start.isAfter(date)) { return 'future'; }
    if (date.isAfter(end)) { return 'ended'; }
    return 'active';
  }

  static getLastActive<T extends IPeriod>(items?: Array<T>): T | undefined {
    if (!items) { return undefined; }
    const now = dayjs();
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (DateHelper.isActive(item.date, item.endDate)) { return item; }
      if (item.endDate.isBefore(now)) { return undefined; }
    }
    return undefined;
  }
}
