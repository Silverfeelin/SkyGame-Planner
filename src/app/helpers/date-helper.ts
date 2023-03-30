import { IDate } from "../interfaces/date.interface";

export class DateHelper {
  static fromInterface(date: Date | IDate): Date | undefined {
    if (!date) { return; }
    if (date instanceof Date) { return date; }
    return new Date(date.year, date.month - 1, date.day);
  }

  static fromString(date: string): Date | undefined {
    if (!date) { return; }
    return new Date(Date.parse(date));
  }
}
