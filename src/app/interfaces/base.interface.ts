import dayjs from 'dayjs';

export interface IGuid {
  guid: string;
}

export interface IConfig<T> {
  items: Array<T>;
}

export interface IPeriod {
  date: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}
