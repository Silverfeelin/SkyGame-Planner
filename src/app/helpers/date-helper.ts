import { IDate } from "../interfaces/date.interface";
import { IPeriod } from '../interfaces/base.interface';
import { DateTime } from 'luxon';

export type PeriodState = 'ended' | 'active' | 'future';

export class DateHelper {
  static readonly skyTimeZone = 'America/Los_Angeles';
  static displayFormat: string;
  static displayFormats: Array<string> = [
    'dd-MM-yyyy',
    'dd/MM/yyyy',
    'MM-dd-yyyy',
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    'yyyy/MM/dd'
  ];

  static isActive(start: DateTime, end: DateTime): boolean {
    const now = DateTime.now();
    return now >= start && now <= end;
  }

  static todayLocal(): DateTime {
    return DateTime.now().startOf('day');
  }

  static todaySky(): DateTime {
    return DateTime.now().setZone(this.skyTimeZone).startOf('day');
  }

  static fromInterfaceLocal(date: IDate | DateTime): DateTime | undefined {
    if (!date) { return; }
    if (date instanceof DateTime) { return date; }
    return DateTime.fromObject({ year: date.year, month: date.month, day: date.day });
  }

  static fromInterfaceSky(date: IDate | DateTime): DateTime | undefined {
    if (!date) { return; }
    if (date instanceof DateTime) { return date; }
    return DateTime.fromObject({ year: date.year, month: date.month, day: date.day }, { zone: this.skyTimeZone });
  }

  static fromStringLocal(date: string | DateTime): DateTime | undefined {
    if (!date) { return; }
    if (date instanceof DateTime) { return date; }
    return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: this.skyTimeZone });
  }

  static fromStringSky(date: string | DateTime): DateTime | undefined {
    if (!date) { return; }
    if (date instanceof DateTime) { return date; }
    return DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: this.skyTimeZone });
  }

  /** Gets the amount of days between two dates, rounded up. */
  static daysBetween(a: DateTime, b: DateTime): number {
    const days = Math.abs(a.diff(b, 'days').as('days'));
    return Math.ceil(days);
  }

  static getStateFromPeriod(start: DateTime, end: DateTime, date?: DateTime): PeriodState {
    date ??= DateTime.now();
    if (start > date) { return 'future'; }
    if (date > end) { return 'ended'; }
    return 'active';
  }

  static groupByPeriod<T extends IPeriod>(items: Array<T>): { ended: Array<T>, active: Array<T>, future: Array<T> } {
    const result = { ended: new Array<T>(), active: new Array<T>(), future: new Array<T>() };
    const now = DateTime.now();
    for (const item of items) {
      const state = DateHelper.getStateFromPeriod(item.date, item.endDate, now);
      result[state].push(item);
    }
    return result;
  }

  /** Returns the first upcoming item. Assumes dates of items are sorted. */
  static getUpcoming<T extends IPeriod>(items?: Array<T>): T | undefined {
    if (!items) { return undefined; }
    const now = DateTime.now();
    let first: T | undefined;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.date > now) { first = item; continue; }
      if (item.date < now) { break; }
    }
    return first;
  }

  /** Returns the last active item. Assumes dates of items are sorted. */
  static getActive<T extends IPeriod>(items?: Array<T>): T | undefined {
    if (!items) { return undefined; }
    const now = DateTime.now();
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (DateHelper.isActive(item.date, item.endDate)) { return item; }
      if (item.endDate < now) { return undefined; }
    }
    return undefined;
  }
}
