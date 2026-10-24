import { IItem, ItemType } from 'skygame-data';
import { ISelection } from './closet-state.service';

export interface ITscFitQuery {
  /** Outfit and cape, plus hair and hair accessory when picked. */
  exact: string[];
  outfit: string[];
  cape: string[];
}

/** What to ask That Sky Collection for one colour of a request, or undefined without both an outfit and a cape. */
export function getTscFitQuery(selection: ISelection): ITscFitQuery | undefined {
  const firstOf = (...types: ItemType[]): IItem | undefined => {
    for (const type of types) {
      // "No hair" style entries aren't items anyone posts.
      const item = Object.values(selection).find(i => i.type === type && i.order !== -1);
      if (item) { return item; }
    }
    return undefined;
  };

  const outfit = firstOf(ItemType.Outfit, ItemType.OutfitShoes);
  const cape = firstOf(ItemType.Cape);
  if (!outfit || !cape) { return undefined; }

  const extras = [firstOf(ItemType.Hair), firstOf(ItemType.HairAccessory)].filter((i): i is IItem => !!i);
  return {
    exact: [outfit.guid, cape.guid, ...extras.map(i => i.guid)],
    outfit: [outfit.guid],
    cape: [cape.guid]
  };
}
