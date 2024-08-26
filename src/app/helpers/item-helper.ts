import { IEvent } from '../interfaces/event.interface';
import { IItem, IItemSource, ItemType } from '../interfaces/item.interface';
import { NodeHelper } from './node-helper';

export const itemTypeOrder: Map<ItemType, number> = new Map([
  [ItemType.Outfit, 1], [ItemType.Shoes, 2], [ItemType.Mask, 3], [ItemType.FaceAccessory, 4],
  [ItemType.Necklace, 5], [ItemType.Hair, 6], [ItemType.Hat, 7], [ItemType.Cape, 8],
  [ItemType.Held, 9], [ItemType.Furniture, 10], [ItemType.Prop, 11], [ItemType.Emote, 12],
  [ItemType.Stance, 13], [ItemType.Call, 14], [ItemType.Music, 15], [ItemType.WingBuff, 16],
  [ItemType.Quest, 17], [ItemType.Spell, 18], [ItemType.Special, 19]
]);

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

  /**
   * Returns the first (or last) source of an item.
   * @remarks This could be incorrect if an item ever swaps type but so far so good...
  */
  static getItemSource(item: IItem, last?: boolean): IItemSource | undefined {
    const i = last ? -1 : 0;
    return item.nodes?.at(i) && { type: 'node', item, source: item.nodes.at(i)! }
      || item.listNodes?.at(i) && { type: 'list', item, source: item.listNodes.at(i)! }
      || item.iaps?.at(i) && { type: 'iap', item, source: item.iaps.at(i)! }
      || undefined;
  }

  /** Sorts items by their order. The array is sorted in-place and returned. */
  static sortItems(items: Array<IItem>): Array<IItem> {
    return items.sort(ItemHelper.sorter);
  }

  static sorter(a: IItem, b: IItem): number {
    if (a.type !== b.type) {
      return (itemTypeOrder.get(a.type) || 99999) - (itemTypeOrder.get(b.type) || 99999);
    }
    const n = (a.order || 99999) - (b.order || 99999);
    if (n !== 0) { return n; }
    if (a.level && b.level) { return a.level - b.level; }
    return a.name.localeCompare(b.name);
  }
}
