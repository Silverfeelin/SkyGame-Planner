import { IEvent } from '../interfaces/event.interface';
import { IItem, ItemType } from '../interfaces/item.interface';
import { NodeHelper } from './node-helper';

export class ItemHelper {
  static getItemsByEvent(eventName: string, type?: ItemType): Array<IItem> {
    const events = (window as any).skyData.eventConfig.items as Array<IEvent>;
    const event = events.find(e => e.name === eventName);
    const items: Array<IItem> = [];
    const itemSet = new Set<IItem>();
    event?.instances?.forEach(instance => {
      instance.spirits?.forEach(spirit => {
        const treeItems = NodeHelper.getItems(spirit.tree.node).filter(i => !itemSet.has(i) && itemSet.add(i));
        type ? items.push(...treeItems.filter(i => i.type === type)) : items.push(...treeItems);
      });

      instance.shops?.forEach(shop => {
        shop.iaps?.forEach(iap => {
          const iapItems = iap.items?.filter(i => !itemSet.has(i) && itemSet.add(i)) || [];
          type ? items.push(...iapItems.filter(i => i.type === type)) : items.push(...iapItems);
        });
      });
    });

    ItemHelper.sortItems(items);
    return items;
  }

  /** Sorts items by their order. The array is sorted in-place and returned. */
  static sortItems(items: Array<IItem>): Array<IItem> {
    return items.sort(ItemHelper.sorter);
  }

  static sorter(a: IItem, b: IItem): number {
    return (a.order || 99999) - (b.order || 99999);
  }
}
