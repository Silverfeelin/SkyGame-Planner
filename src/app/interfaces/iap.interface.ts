import { IConfig, IGuid } from "./base.interface";
import { IItem } from "./item.interface";
import { IShop } from "./shop.interface";

export interface IIAPConfig extends IConfig<IIAP> {}

export interface IIAP extends IGuid {
  /** Price in USD. */
  price?: number;

  /** Regular candles included in purchase. */
  c?: number;
  /** Season candles included in purchase. */
  sc?: number;

  /// References ///

  items?: Array<IItem>;
  shop?: IShop;

  /// Progress ///

  bought?: boolean;
}
