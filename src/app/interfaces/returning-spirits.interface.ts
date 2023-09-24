import { IConfig, IGuid } from "./base.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ISpirit } from "./spirit.interface";
import dayjs from 'dayjs';
import { IArea } from './area.interface';
import { IWiki } from './wiki.interface';

export interface IReturningSpiritsConfig extends IConfig<IReturningSpirits> {}

export interface IReturningSpirits extends IGuid {
  /** Name of the occassion. */
  name?: string;
  /** First day of TS visit. */
  date: dayjs.Dayjs;
  /** Last day of TS visit. */
  endDate: dayjs.Dayjs;

  /** Area the spirits visited.  */
  area?: IArea;
  /** Visiting spirits. */
  spirits: Array<IReturningSpirit>;

  _wiki?: IWiki;
}

export interface IReturningSpirit extends IGuid {
  /// References ///
  return: IReturningSpirits;
  spirit: ISpirit;
  tree: ISpiritTree;
}
