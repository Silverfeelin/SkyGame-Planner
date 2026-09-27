import { ItemType, IItem, IEvent, IItemSource, IItemSourceOrigin, IEventInstance, ISeason, IShop, ISpiritTree } from 'skygame-data';
import { DateTime } from 'luxon';
import { TreeHelper } from './tree-helper';
import { DateHelper } from './date-helper';
import type { DataService } from '@app/services/data.service';

type OngoingData = Pick<DataService, 'spiritConfig' | 'seasonConfig' | 'eventConfig' | 'travelingSpiritConfig' | 'returningSpiritsConfig'>;

export const itemTypeOrder: Map<ItemType, number> = new Map([
  [ItemType.Outfit, 1], [ItemType.Shoes, 2], [ItemType.OutfitShoes, 3], [ItemType.Mask, 4], [ItemType.FaceAccessory, 5],
  [ItemType.Necklace, 6], [ItemType.Hair, 7], [ItemType.HairAccessory, 8], [ItemType.HeadAccessory, 9],
  [ItemType.Cape, 10], [ItemType.Held, 11], [ItemType.Furniture, 12], [ItemType.Prop, 13],
  [ItemType.Emote, 14], [ItemType.Stance, 15], [ItemType.Call, 16], [ItemType.Music, 17],
  [ItemType.WingBuff, 18], [ItemType.Quest, 19], [ItemType.Spell, 20], [ItemType.Special, 21]
]);

export class ItemHelper {
  static getItemsByEvent(eventName: string, type?: ItemType): Array<IItem> {
    const events = (window as any).skyData.eventConfig.items as Array<IEvent>;
    const event = events.find(e => e.name === eventName);
    const items: Array<IItem> = [];
    const itemSet = new Set<IItem>();
    event?.instances?.forEach(instance => {
      instance.spirits?.forEach(spirit => {
        const items = TreeHelper.getItems(spirit.tree);
        const treeItems = items.filter(i => !itemSet.has(i) && itemSet.add(i));
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
      || item.hiddenNodes?.at(i) && { type: 'node', item, source: item.hiddenNodes.at(i)! }
      || undefined;
  }

  /** Returns the event or season the given item source was found in. */
  static geSourceOrigin(itemSource: IItemSource | undefined): IItemSourceOrigin | undefined {
    if (!itemSource) { return undefined; }
    let eventInstance: IEventInstance | undefined;
    let season: ISeason | undefined;
    switch (itemSource.type) {
      case 'node':
        eventInstance = itemSource.source.root?.tree?.eventInstanceSpirit?.eventInstance;
        season = itemSource.source.root?.tree?.spirit?.season;
        break;
      case 'list':
        eventInstance = itemSource.source.itemList.shop?.event;
        season = itemSource.source.itemList.shop?.season;
        break;
      case 'iap':
        eventInstance = itemSource.source.shop?.event;
        season = itemSource.source.shop?.season;
        break;
    }

    if (eventInstance) { return { type: 'event', source: eventInstance }; }
    if (season) { return { type: 'season', source: season }; }
    return undefined;
  }

  /**
   * Items the game can show in the closet without the player owning them, keyed by GUID:
   * regular and elder spirit trees plus everything in the active season, events, traveling spirit and returning spirits.
   */
  static getOngoingItems(data: OngoingData, now = DateTime.now()): Record<string, IItem> {
    const ongoingItems: Record<string, IItem> = {};
    const addTree = (tree?: ISpiritTree) => TreeHelper.getItems(tree).forEach(item => ongoingItems[item.guid] = item);
    const addShop = (shop: IShop) => {
      shop.iaps?.forEach(iap => iap.items?.forEach(item => ongoingItems[item.guid] = item));
      shop.itemList?.items?.forEach(node => ongoingItems[node.item.guid] = node.item);
    };

    data.spiritConfig.items.filter(s => s.type === 'Regular' || s.type === 'Elder').forEach(spirit => addTree(spirit.tree));
    const season = DateHelper.getActive(data.seasonConfig.items, now);
    season?.spirits?.forEach(spirit => addTree(spirit.tree));
    season?.shops?.forEach(addShop);
    data.eventConfig.items.forEach(event => {
      const instance = DateHelper.getActive(event.instances, now);
      instance?.spirits?.forEach(spirit => addTree(spirit.tree));
      instance?.shops?.forEach(addShop);
    });
    addTree(DateHelper.getActive(data.travelingSpiritConfig.items, now)?.tree);
    DateHelper.getActive(data.returningSpiritsConfig.items, now)?.spirits?.forEach(spirit => addTree(spirit.tree));
    return ongoingItems;
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

  static serializeQuery(items: Array<IItem>): string {
    let ids = items.map(i => (i.id || 0).toString(36).padStart(3, '0')).join('');
    ids = ids.substring(0, 1800);
    return ids;
  }

  static deserializeQuery(ids: string): Array<number> {
    const nrs = new Set<number>();
    for (let i = 0; i < ids.length; i += 3) {
      const segment = ids.substring(i, i + 3);
      const number = parseInt(segment, 36);
      nrs.add(number);
    }
    return Array.from(nrs);
  }
}
