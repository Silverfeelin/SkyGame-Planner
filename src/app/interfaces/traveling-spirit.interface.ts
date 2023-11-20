import { IConfig, IGuid, IPeriod } from "./base.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ISpirit } from "./spirit.interface";

export interface ITravelingSpiritConfig extends IConfig<ITravelingSpirit> {}

export interface ITravelingSpirit extends IGuid, IPeriod {
  /** Traveling Spirit number, starting at 1 for the first TS visit. */
  number: number;
  /** This is the n-th visit of this spirit. */
  visit: number;

  /// References ///
  spirit: ISpirit;
  tree: ISpiritTree;
}
