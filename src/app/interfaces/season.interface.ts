import { IConfig, IGuid } from "./base.interface";
import { IShop } from "./shop.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISeasonConfig extends IConfig<ISeason> {}

export interface ISeason extends IGuid {
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

  /** Start date of the season. */
  date: Date | string;
  /** Inclusive end date of the season. */
  endDate: Date | string;

  /** Season number, starting at 1 for Gratitude. */
  number: number;

  /// References ///

  /** Season spirits.
  * @remarks Includes season guide.
  */
  spirits: Array<ISpirit>;

  /** Season IAP shops. */
  shops?: Array<IShop>;

  /// Metadata ///

  /** wiki data. */
  _wiki?: IWiki;
}
