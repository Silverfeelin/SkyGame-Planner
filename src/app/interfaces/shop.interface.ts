import { IConfig, IGuid } from "./base.interface";
import { IDate } from "./date.interface";
import { IEventInstance } from "./event.interface";
import { IIAP } from "./iap.interface";
import { ISeason } from "./season.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface IShopConfig extends IConfig<IShop> {}

export type ShopType = 'store' | 'spirit' | 'object';

export interface IShop extends IGuid {
  type: ShopType;
  name?: string;

  date?: Date | IDate;
  endDate?: Date | IDate;

  permanent?: boolean;

  /// References ///
  iaps?: Array<IIAP>;
  event?: IEventInstance;
  spirit?: ISpirit;
  season?: ISeason;

  _wiki?: IWiki;
}
