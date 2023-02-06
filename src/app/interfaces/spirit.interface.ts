import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { ISeason } from "./season.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ITravelingSpirit } from "./traveling-spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISpiritConfig extends IConfig<ISpirit> {}

export interface ISpirit extends IGuid {
  /** Name of the spirit. */
  name: string;
  /** Type of the spirit. */
  type: SpiritType;

  /// References ///

  /** Main spirit tree.
  * For regular spirits this is the constellation tree.
  * For season spirits this is the seasonal tree.
  */
  tree?: ISpiritTree;
  /** Area this spirit can be found in normally. */
  area?: IArea;
  /** Season this spirit is part of. */
  season?: ISeason;
  /** All Traveling Spirit visits of this spirit. */
  ts?: Array<ITravelingSpirit>;

  /// Progress ///

  /** Memory of spirit is relived. */
  relived?: boolean;

  /// Metadata ///

  /** Wiki data. */
  _wiki?: IWiki
}

export enum SpiritType {
  Regular = 'Regular',
  Elder = 'Elder',
  Guide = 'Guide',
  Season = 'Season',
  Special = 'Special'
}
