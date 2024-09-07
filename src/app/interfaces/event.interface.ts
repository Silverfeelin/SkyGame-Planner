import { IConfig, IGuid, IPeriod } from "./base.interface";
import { ICalculatorData } from './calculator-data.interface';
import { IShop } from "./shop.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ISpirit } from "./spirit.interface";
import { ICalendarFm, IWiki } from "./wiki.interface";

export interface IEventConfig extends IConfig<IEvent> {}

export interface IEvent extends IGuid {
  /** Name of the event. */
  name: string;
  shortName?: string;

  /** Path to overview image. */
  imageUrl?: string;
  imagePosition?: string;
  /** If true, the event recurs regularly (generally yearly). */
  recurring?: boolean;

  /// References ///
  instances?: Array<IEventInstance>;

  /// Metadata ///
  _wiki?: IWiki;
}

export interface IEventInstance extends IGuid, IPeriod {
  /** Name for older event instances, used if an event changes name throughout time. */
  name?: string;
  shortName?: string;

  /** Event instance number starting at 1. */
  number: number;

  /** Event calculator data */
  calculatorData?: ICalculatorData;

  /** If marked as draft, data may be inaccurate or incomplete. */
  draft?: boolean;

  /// References ///
  event: IEvent;
  shops: Array<IShop>;
  spirits: Array<IEventInstanceSpirit>;

  /// Metadata ///
  _calendar?: ICalendarFm;
}

export interface IEventInstanceSpirit extends IGuid {
  /** Custom name to better identify spirit. */
  name?: string;

  /// References ///
  spirit: ISpirit;
  tree: ISpiritTree;
  eventInstance?: IEventInstance;
}
