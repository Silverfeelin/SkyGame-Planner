import { IConfig, IGuid } from "./base.interface";
import { IDate } from "./date.interface";
import { IShop } from "./shop.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface IEventConfig extends IConfig<IEvent> {}

export interface IEvent extends IGuid {
  name: string;

  /// References
  instances?: Array<IEventInstance>;


  _wiki?: IWiki;
}

export interface IEventInstance extends IGuid {
  date: Date | IDate;
  endDate: Date | IDate;

  /** Event instance number starting at 1. */
  number: number;

  /// References
  event: IEvent;
  shops: Array<IShop>;
  spirits: Array<IEventInstanceSpirit>;
}

export interface IEventInstanceSpirit extends IGuid {
  spirit: ISpirit;
  tree: ISpiritTree;
}
