import { DateTime } from 'luxon';

export interface IGuid {
  guid: string;
}

export interface IConfig<T> {
  items: Array<T>;
}

export interface IPeriod {
  date: DateTime;
  endDate: DateTime;
}
