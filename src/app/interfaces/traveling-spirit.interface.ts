import { IConfig, IGuid } from "./base.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { IDate } from "./date.interface";
import { ISpirit } from "./spirit.interface";

export interface ITravelingSpiritConfig extends IConfig<ITravelingSpirit> {}

export interface ITravelingSpirit extends IGuid {
  /** First day of TS visit. */
  date: Date | IDate;
  /** Last day of TS visit. */
  endDate: Date | IDate;

  /** Traveling Spirit number, starting at 1 for the first TS visit. */
  number: number;
  /** This is the n-th visit of this spirit. */
  visit: number;

  /// References ///
  spirit: ISpirit;
  tree: ISpiritTree;
}
