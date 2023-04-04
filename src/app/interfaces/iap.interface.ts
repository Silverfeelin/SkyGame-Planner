import { IConfig, IGuid } from "./base.interface";
import { IItem } from "./item.interface";
import { IShop } from "./shop.interface";

export interface IIAPConfig extends IConfig<IIAP> {}

export interface IIAP extends IGuid {
  /** Price in USD. */
  price?: number;
  /** Name of the IAP. */
  name?: string;
  /** If true this is a returning IAP or catch-up pack. */
  returning?: boolean;

  /** Regular candles included in purchase. */
  c?: number;
  /** Season candles included in purchase. */
  sc?: number;
  /** Season Gift Passes included in purchase. */
  sp?: number;

  /// References ///

  items?: Array<IItem>;
  shop?: IShop;

  /// Progress ///

  bought?: boolean;
}
