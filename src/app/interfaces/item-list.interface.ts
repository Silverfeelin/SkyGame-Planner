import { IConfig, IGuid } from './base.interface';
import { ICost } from './cost.interface';
import { IItem } from './item.interface';
import { IShop } from './shop.interface';

export interface IItemListConfig extends IConfig<IItemList> {}

export interface IItemList extends IGuid {
  /** All items in the list. */
  items: Array<IItemListNode>;
  description?: string;

  /// References ///
  shop?: IShop;

}

export interface IItemListNode extends IGuid, ICost {
  /** Item unlocked through this node. */
  item: IItem;

  /// References ///
  itemList: IItemList;

  /// Progress ///
  unlocked?: boolean;
}
