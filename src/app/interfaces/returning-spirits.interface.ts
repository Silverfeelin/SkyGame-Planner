import { IConfig, IGuid, IPeriod } from "./base.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ISpirit } from "./spirit.interface";
import { IArea } from './area.interface';
import { ICalendarFm, IWiki } from './wiki.interface';

export interface IReturningSpiritsConfig extends IConfig<IReturningSpirits> {}

export interface IReturningSpirits extends IGuid, IPeriod {
  /** Name of the occassion. */
  name?: string;

  /** Area the spirits visited.  */
  area?: IArea;
  /** Visiting spirits. */
  spirits: Array<IReturningSpirit>;

  imageUrl?: string;

  /// Metadata ///
  _wiki?: IWiki;
  _calendar?: ICalendarFm;
}

export interface IReturningSpirit extends IGuid {
  /// References ///
  return: IReturningSpirits;
  spirit: ISpirit;
  tree: ISpiritTree;
}
