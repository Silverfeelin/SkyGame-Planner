import { IEvent, IItem, IItemSource, IRealm, ISeason, IShop, ISpirit } from 'skygame-data';
import { ItemHelper } from '@app/helpers/item-helper';

/** Where an item comes from, in the terms players remember it by. */
export interface IClosetItemInfo {
  spirit?: ISpirit;
  season?: ISeason;
  event?: IEvent;
  realm?: IRealm;
  shop?: IShop;
  unlock?: string;
}

const unlockLabels: Record<IItemSource['type'], string> = {
  node: 'Spirit tree',
  list: 'Shop',
  iap: 'In-app purchase'
};

const infoCache = new WeakMap<IItem, IClosetItemInfo>();

export function getClosetItemInfo(item: IItem): IClosetItemInfo {
  let info = infoCache.get(item);
  if (info) { return info; }

  const first = ItemHelper.getItemSource(item);
  const last = ItemHelper.getItemSource(item, true);
  const firstOrigin = ItemHelper.geSourceOrigin(first);
  // Recurring events are named after their latest instance, like the items page does.
  const lastOrigin = ItemHelper.geSourceOrigin(last);
  const spirit = getSourceSpirit(last);

  let unlock = first && unlockLabels[first.type];
  if (first?.type !== 'iap' && item.iaps?.length) {
    unlock = unlock ? `${unlock}, in-app purchase` : unlockLabels.iap;
  }

  info = {
    spirit,
    season: (firstOrigin?.type === 'season' ? firstOrigin.source : undefined)
      ?? (first?.type === 'node' ? first.source.root?.tree?.travelingSpirit?.spirit.season : undefined)
      ?? item.season,
    event: lastOrigin?.type === 'event' ? lastOrigin.source.event : undefined,
    realm: spirit?.area?.realm,
    shop: last?.type === 'list' ? last.source.itemList.shop : last?.type === 'iap' ? last.source.shop : undefined,
    unlock
  };
  infoCache.set(item, info);
  return info;
}

function getSourceSpirit(source: IItemSource | undefined): ISpirit | undefined {
  switch (source?.type) {
    case 'node': {
      const tree = source.source.root?.tree;
      return tree?.spirit
        ?? tree?.travelingSpirit?.spirit
        ?? tree?.eventInstanceSpirit?.spirit
        ?? tree?.specialVisitSpirit?.spirit;
    }
    case 'list': return source.source.itemList.shop?.spirit;
    case 'iap': return source.source.shop?.spirit;
    default: return undefined;
  }
}
