import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { IEventInstanceSpirit } from "./event.interface";
import { IReturningSpirit } from "./returning-spirits.interface";
import { ISeason } from "./season.interface";
import { IShop } from "./shop.interface";
import { ISpiritTree, IRevisedSpiritTree as IRevisedSpiritTree } from "./spirit-tree.interface";
import { ITravelingSpirit } from "./traveling-spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISpiritConfig extends IConfig<ISpirit> {}

export type SpiritType =  'Regular' | 'Elder' | 'Guide' | 'Season' | 'Event' | 'Special';

export interface ISpirit extends IGuid {
  /** Name of the spirit. */
  name: string;
  /** Type of the spirit. */
  type: SpiritType;

  /** Image URL. */
  imageUrl?: string;

  /// References ///

  /**
   * Main spirit tree(s).
   * For regular spirits this is the constellation tree.
   * For season spirits this is the seasonal tree.
   */
  tree?: ISpiritTree;

  /** Revised versions of the main spirit tree. */
  treeRevisions?: Array<IRevisedSpiritTree>;

  /** Area this spirit can be found in normally. */
  area?: IArea;
  /** Season this spirit is part of. */
  season?: ISeason;
  /** All Traveling Spirit visits of this spirit. */
  ts?: Array<ITravelingSpirit>;
  /** All visits as returning spirits.  */
  returns?: Array<IReturningSpirit>;
  /** All visits during events. */
  events?: Array<IEventInstanceSpirit>;
  /** All shop instances. */
  shops?: Array<IShop>;

  /// Progress ///

  /** Memory of spirit is relived. */
  relived?: boolean;

  /// Metadata ///
  _wiki?: IWiki
  _index: number;
}
