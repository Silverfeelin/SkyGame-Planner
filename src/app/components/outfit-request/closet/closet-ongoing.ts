import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CLOSET_TYPES, IClosetGroup, IClosetGroupRow } from './closet-groups';

export type OngoingView = 'season' | 'event';

const typeOrder = CLOSET_TYPES.reduce((m, t, i) => (m[t] = i, m), {} as Record<string, number>);

/** Closet items in tree order, grouped by type like the closet. */
function closetItems(items: IItem[]): IItem[] {
  return items.filter(i => typeOrder[i.type] !== undefined)
    .sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
}

function group(key: string, label: string, rows: Array<Omit<IClosetGroupRow, 'order'>>): IClosetGroup {
  return {
    key: `ongoing:${key}`, label, order: 0,
    count: rows.reduce((n, r) => n + r.items.length, 0),
    rows: rows.map((r, i) => ({ ...r, order: i }))
  };
}

/** What can be unlocked in-game right now: the Traveling Spirit and Returning Spirits for Season, the running events for Event. */
export function getOngoingGroups(data: DataService, view: OngoingView): IClosetGroup[] {
  return view === 'season' ? [...travelingSpiritGroups(data), ...returningSpiritGroups(data)] : eventGroups(data);
}

function travelingSpiritGroups(data: DataService): IClosetGroup[] {
  const ts = data.travelingSpiritConfig.items.at(-1);
  if (!ts) { return []; }
  const state = DateHelper.getStateFromPeriod(ts.date, ts.endDate);
  if (state === 'ended') { return []; }
  const items = closetItems(TreeHelper.getItems(ts.tree));
  // The spirit isn't announced before it arrives.
  const label = state === 'future' ? `TS #${ts.number}` : `TS #${ts.number} - ${ts.spirit.name}`;
  return [group('ts', label, [{ key: 'ts', label: '', items }])];
}

function returningSpiritGroups(data: DataService): IClosetGroup[] {
  const rs = data.returningSpiritsConfig.items.at(-1);
  if (!rs || DateHelper.getStateFromPeriod(rs.date, rs.endDate) !== 'active') { return []; }
  const rows = (rs.spirits || []).map(s => ({
    key: s.spirit.guid, label: s.spirit.name, items: closetItems(TreeHelper.getItems(s.tree))
  }));
  return [group('rs', rs.name || 'Special visit', rows)];
}

function eventGroups(data: DataService): IClosetGroup[] {
  return data.eventConfig.items
    .map(e => e.instances?.at(-1))
    .filter(i => !!i && DateHelper.isActive(i.date, i.endDate))
    .map(instance => {
      const shops = instance!.shops || [];
      const items = [
        ...(instance!.spirits || []).flatMap(s => TreeHelper.getItems(s.tree)),
        ...shops.flatMap(s => s.itemList?.items || []).map(n => n.item)
      ];
      const iapItems = shops.flatMap(s => s.iaps || []).flatMap(a => a.items || []);
      return group(instance!.guid, `${instance!.name || instance!.event.name} ${instance!.date.year}`, [
        { key: 'currency', label: 'In-game currency', items: closetItems(items) },
        { key: 'iap', label: 'In-App Purchase', items: closetItems(iapItems) }
      ]);
    });
}
