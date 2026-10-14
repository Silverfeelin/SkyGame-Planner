import { ISeason } from 'skygame-data';

export interface ISeasonPlanner {
  label: 'Optimizer' | 'Calculator';
  link: string;
}

export class SeasonHelper {
  /**
   * Returns the quarter (1-4) a season falls in, given its number.
   * @remarks Seasons run 4 per year, except the first year which only had 3.
   */
  static getQuarter(number: number): number {
    if (number <= 3) { return number; }
    return ((number - 4) % 4) + 1;
  }

  /** Seasons with friendship tiers are planned in the optimizer, older seasons in the calculator. */
  static usesOptimizer(season?: ISeason): boolean {
    return !!season?.spirits.some(s => s.tree?.tier);
  }

  static getPlanner(season?: ISeason): ISeasonPlanner {
    return SeasonHelper.usesOptimizer(season)
      ? { label: 'Optimizer', link: '/season/optimizer' }
      : { label: 'Calculator', link: '/season/calculator' };
  }
}
