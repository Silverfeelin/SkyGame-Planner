import { IConfig, IGuid, IPeriod } from "./base.interface";
import { IShop } from "./shop.interface";
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

  /** If marked as draft, data may be inaccurate or incomplete. */
  draft?: boolean;

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
