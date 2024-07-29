import { DateTime } from 'luxon';
import { IGuid } from './base.interface';

export interface ICalculatorData {
  dailyCurrencyAmount?: number;
  timedCurrency?: Array<ICalculatorDataTimedCurrency>;
};

export interface ICalculatorDataTimedCurrency extends IGuid {
  date: DateTime;
  endDate: DateTime;
  amount: number;
}
