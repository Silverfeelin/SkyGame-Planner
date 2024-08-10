import { IConfig, IGuid } from "./base.interface";
import { IEventInstance } from "./event.interface";
import { IIAP } from "./iap.interface";
import { IItemList } from './item-list.interface';
import { ISeason } from "./season.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";
import { DateTime } from 'luxon';

export interface IShopConfig extends IConfig<IShop> {}

export type ShopType = 'Store' | 'Spirit' | 'Object';

export interface IShop extends IGuid {
  type: ShopType;
  name?: string;

  date?: DateTime;
  endDate?: DateTime;

  permanent?: boolean | string;

  /// References ///
  iaps?: Array<IIAP>;
  itemList?: IItemList;
  event?: IEventInstance;
  spirit?: ISpirit;
  season?: ISeason;

  _wiki?: IWiki;
}
