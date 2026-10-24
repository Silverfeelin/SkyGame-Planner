import { IItem, IRealm, ItemType } from 'skygame-data';
import { ItemHelper } from '@app/helpers/item-helper';
import { ClosetView } from './closet-state.service';
import { getClosetItemInfo, IClosetItemInfo } from './closet-item-info';

/** Item types shown in the closet, by grid column. */
export const CLOSET_SECTIONS: ItemType[][] = [
  [ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes],
  [ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace],
  [ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory],
  [ItemType.Cape],
  [ItemType.Held, ItemType.Furniture, ItemType.Prop]
];

export const CLOSET_TYPES: ItemType[] = CLOSET_SECTIONS.flat();

export const CLOSET_TYPE_ICONS: Record<string, string> = {
  'Outfit': 'outfit', 'Shoes': 'shoes', 'OutfitShoes': 'outfit-shoes',
  'Mask': 'mask', 'FaceAccessory': 'face-acc', 'Necklace': 'necklace',
  'Hair': 'hair', 'HairAccessory': 'hair-acc', 'HeadAccessory': 'head-acc',
  'Cape': 'cape', 'Held': 'held', 'Furniture': 'shelf', 'Prop': 'cup'
};

export interface IClosetGroupRow {
  key: string;
  label: string;
  items: IItem[];
  order: number;
}

export interface IClosetGroup {
  key: string;
  label: string;
  iconUrl?: string;
  count: number;
  rows: IClosetGroupRow[];
  order: number;
}

type GroupedView = Exclude<ClosetView, 'type'>;

const ROW_LAST = Number.MAX_SAFE_INTEGER;

/**
 * Groups items by season, event or realm, with a row per spirit (or shop, for items without one).
 * Every item lands in exactly one view: season items under Season, event items under Event, and the rest under Realm.
 * Results combine those groups, ordered by the best match in each; pass the items in order of relevance.
 */
export function groupClosetItems(items: IItem[], groupBy: GroupedView, realms: IRealm[]): IClosetGroup[] {
  const groups = new Map<string, IClosetGroup>();

  for (const item of items) {
    const info = getClosetItemInfo(item);
    const group = getGroup(groups, info, groupBy, realms);
    if (!group) { continue; }

    const row = getRow(group, info, groupBy);
    row.items.push(item);
    group.count++;
  }

  const result = [...groups.values()].sort((a, b) => a.order - b.order);
  for (const group of result) {
    group.rows.sort((a, b) => a.order - b.order);
    group.rows.forEach(r => ItemHelper.sortItems(r.items));
  }
  return result;
}

function getGroup(groups: Map<string, IClosetGroup>, info: IClosetItemInfo, groupBy: GroupedView, realms: IRealm[]): IClosetGroup | undefined {
  let key: string;
  let create: () => Omit<IClosetGroup, 'count' | 'rows'>;
  switch (groupBy) {
    case 'season': {
      const season = info.season;
      if (!season) { return undefined; }
      key = season.guid;
      create = () => ({ key, label: season.name, iconUrl: season.iconUrl, order: -season.number });
      break;
    }
    case 'event': {
      const event = info.event;
      if (!event) { return undefined; }
      key = event.guid;
      // Most recently held first.
      create = () => ({ key, label: event.name, order: -(event.instances?.at(-1)?.date.toMillis() ?? 0) });
      break;
    }
    case 'realm': {
      if (info.season || info.event) { return undefined; }
      const realm = info.realm;
      key = realm?.guid ?? 'other';
      create = () => realm
        ? { key, label: realm.name, order: realms.indexOf(realm) }
        : { key, label: 'Shops and other', order: ROW_LAST };
      break;
    }
    case 'results': {
      const origin = info.season ?? info.event ?? info.realm;
      key = origin?.guid ?? 'other';
      create = () => ({ key, label: origin?.name ?? 'Shops and other', iconUrl: info.season?.iconUrl, order: groups.size });
      break;
    }
  }

  let group = groups.get(key);
  if (!group) {
    group = { ...create(), count: 0, rows: [] };
    groups.set(key, group);
  }
  return group;
}

function getRow(group: IClosetGroup, info: IClosetItemInfo, groupBy: GroupedView): IClosetGroupRow {
  const spirit = info.spirit;
  const label = spirit?.name || info.shop?.name || info.unlock || 'Other';
  // Unnamed shops share a row per unlock type instead of each showing the same label.
  const key = spirit?.guid ?? `label:${label}`;
  let row = group.rows.find(r => r.key === key);
  if (row) { return row; }

  let order = ROW_LAST;
  if (groupBy === 'results') {
    order = group.rows.length;
  } else if (spirit) {
    if (groupBy === 'season') {
      const i = info.season?.spirits.indexOf(spirit) ?? -1;
      order = i >= 0 ? i : ROW_LAST - 1;
    } else if (groupBy === 'realm') {
      // Follow the in-game route through the realm's areas.
      const area = spirit.area;
      const areaIndex = area ? info.realm?.areas?.indexOf(area) ?? 0 : 0;
      order = areaIndex * 1000 + (area?.spirits?.indexOf(spirit) ?? 0);
    } else {
      order = group.rows.length;
    }
  }

  row = { key, label, items: [], order };
  group.rows.push(row);
  return row;
}
