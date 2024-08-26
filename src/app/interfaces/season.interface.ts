import { IConfig, IGuid, IPeriod } from "./base.interface";
import { ICalculatorData } from './calculator-data.interface';
import { IShop } from "./shop.interface";
import { ISpiritTree } from './spirit-tree.interface';
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISeasonConfig extends IConfig<ISeason> {}

export interface ISeason extends IGuid, IPeriod {
  /** Name of the season. */
  name: string;
  /** Short name of the season. */
  shortName: string;

  /** Path to the season icon. */
  iconUrl?: string;
  imageUrl?: string;
  imagePosition?: string;

  /** Year of the season. */
  year: number;

  /** Season number, starting at 1 for Gratitude. */
  number: number;

  /** Season calculator data */
  calculatorData?: ICalculatorData;

  /** If marked as draft, data may be inaccurate or incomplete. */
  draft?: boolean;

  /// References ///

  /** Season spirits.
  * @remarks Includes season guide.
  */
  spirits: Array<ISpirit>;

  /** Season shops. */
  shops?: Array<IShop>;

  /**
   * Spirit trees included in the season.
   * These trees are typically introduced in but are not limited to the season (i.e. Compassionate Cellist).
   * @remarks Do not include season spirit trees (guide, spirits), these are included via the spirits property.
  */
  includedTrees?: Array<ISpiritTree>;

  /// Metadata ///

  /** wiki data. */
  _wiki?: IWiki;
}
