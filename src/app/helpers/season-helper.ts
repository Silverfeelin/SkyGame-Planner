export class SeasonHelper {
  /**
   * Returns the quarter (1-4) a season falls in, given its number.
   * @remarks Seasons run 4 per year, except the first year which only had 3.
   */
  static getQuarter(number: number): number {
    if (number <= 3) { return number; }
    return ((number - 4) % 4) + 1;
  }
}
