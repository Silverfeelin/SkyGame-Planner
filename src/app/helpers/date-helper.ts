import { IDate } from "../interfaces/date.interface";

export class DateHelper {
  static fromInterface(date: Date | IDate): Date | undefined {
    if (!date) { return; }
    if (date instanceof Date) { return date; }
    return new Date(date.year, date.month, date.day);
  }
}
