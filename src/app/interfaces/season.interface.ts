import { IConfig, IGuid } from "./base.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISeasonConfig extends IConfig<ISeason> {}

export interface ISeason extends IGuid {
  /** Name of the season. */
  name: string;
  /** Short name of the season. */
  shortName: string;

  /** Year of the season. */
  year: number;

  /** Start date of the season. */
  start: Date;
  /** Inclusive end date of the season. */
  end: Date;

  /** Season number, starting at 1 for Gratitude. */
  number: number;

  /// References ///

  /** Season spirits.
  * @remarks Includes season guide.
  */
  spirits: Array<ISpirit>;

  /// Metadata ///

  /** wiki data. */
  _wiki?: IWiki;
}
