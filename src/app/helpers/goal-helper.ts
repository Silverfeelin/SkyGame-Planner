import { DateTime } from 'luxon';
import { ICost, IIAP, IItem, IItemListNode, INode, IPeriod, IRevisedSpiritTree, IShop, ISpirit, ISpiritTree } from 'skygame-data';
import { CostHelper } from './cost-helper';
import { DateHelper } from './date-helper';
import { NodeHelper } from './node-helper';

export type GoalWindow =
  | { kind: 'permanent' }
  | { kind: 'limited'; label: string; endDate: DateTime }
  | { kind: 'upcoming'; label: string; startDate: DateTime; endDate: DateTime }
  | { kind: 'unavailable'; label?: string };

export type GoalSource =
  | { type: 'node'; node: INode; window: GoalWindow }
  | { type: 'list'; listNode: IItemListNode; window: GoalWindow }
  | { type: 'iap'; iap: IIAP; window: GoalWindow };

/** Currencies saved up over time. Season and event currencies are left to their own calculators. */
export type GoalBucketKey = 'c' | 'h' | 'ac';

export interface IGoalBucket {
  balance: number;
  perDay: number;
}

/** Items the projection leaves out: season spirit or season/event currency items. */
export type GoalLimitedCurrency =
  | { kind: 'season'; seasonGuid?: string }
  | { kind: 'event'; eventInstanceGuid?: string };

/** How a currency pool gets from its balance to what all goals together need. */
export interface IGoalBucketPlan extends IGoalBucket {
  key: GoalBucketKey;
  needed: number;
  /** Day the last of the needed currency is collected; undefined if nothing needs collecting. */
  doneDate?: DateTime;
}

export interface IGoalPlan {
  goals: Array<IGoalProjection>;
  buckets: Array<IGoalBucketPlan>;
}

/** Format of the day keys used for skipped days. */
export const GOAL_DAY_FORMAT = 'yyyy-MM-dd';

export type GoalStatus = 'owned' | 'included' | 'unavailable' | 'purchase' | 'unknown' | 'affordable' | 'projected' | 'never';

export interface IGoalProjection {
  item: IItem;
  source?: GoalSource;
  /** Cost not already covered by goals higher in the list. */
  cost: ICost;
  price: number;
  status: GoalStatus;
  /** Calendar days from today until every currency this goal (and the goals above it) needs has been saved. */
  days?: number;
  date?: DateTime;
  /** Projected date falls after the item stops being available. */
  late?: boolean;
  /** The currency is saved before the item becomes available, so the date waits for its start. */
  waitsForStart?: boolean;
  /** Higher goal whose spirit tree path already unlocks this item. */
  includedIn?: IGoalProjection;
  /** Higher goals that stay available for longer, so this one may be better placed above them. */
  beforeHigher?: Array<IGoalProjection>;
  /** Currencies that are short and have no daily income. */
  blockedBy?: Array<GoalBucketKey>;
  /** An earlier node in the spirit tree path costs event currency, which the projection does not count. */
  requiresEventCurrency?: boolean;
}

/** Spirit types whose current tree can always be visited. */
const PERMANENT_SPIRIT_TYPES = new Set<string>(['Regular', 'Elder', 'Guide']);

export class GoalHelper {
  /** Picks the source the item can be unlocked from soonest: permanent, then limited, then the earliest upcoming. */
  static resolveSource(item: IItem): GoalSource | undefined {
    const sources: Array<GoalSource> = [
      ...(item.nodes ?? []).map(node => ({ type: 'node' as const, node, window: this.nodeWindow(node) })),
      ...(item.listNodes ?? []).map(listNode => ({ type: 'list' as const, listNode, window: this.shopWindow(listNode.itemList?.shop) })),
      ...(item.iaps ?? []).map(iap => ({ type: 'iap' as const, iap, window: this.shopWindow(iap.shop) }))
    ];

    // Later sources carry the most recent prices.
    sources.reverse();
    const upcoming = sources
      .filter(s => s.window.kind === 'upcoming')
      .sort((a, b) => this.windowStart(a.window)!.toMillis() - this.windowStart(b.window)!.toMillis());
    return sources.find(s => s.window.kind === 'permanent')
      ?? sources.find(s => s.window.kind === 'limited')
      ?? upcoming[0]
      ?? sources[0];
  }

  /** Whether the item belongs with season or event planning rather than the goal projection. */
  static limitedCurrency(item: IItem): GoalLimitedCurrency | undefined {
    if (item.unlocked) { return undefined; }
    const source = this.resolveSource(item);
    if (!source) { return undefined; }
    // Season pass and tier requirements gate these nodes, which a currency projection cannot account for.
    if (source.type === 'node' && source.window.kind === 'limited' && this.isSeasonSpiritNode(source.node)) {
      return { kind: 'season', seasonGuid: this.sourceSeasonGuid(source) };
    }

    const cost = CostHelper.create();
    let ownEventCurrency = false;
    switch (source.type) {
      case 'node':
        NodeHelper.trace(source.node).filter(n => !n.unlocked && !n.item?.unlocked).forEach(n => CostHelper.add(cost, n));
        ownEventCurrency = !!source.node.ec;
        break;
      case 'list':
        CostHelper.add(cost, source.listNode);
        ownEventCurrency = !!source.listNode.ec;
        break;
      case 'iap': return undefined;
    }
    if (cost.sc || cost.sh) { return { kind: 'season', seasonGuid: this.sourceSeasonGuid(source) }; }
    // Event currency earlier in the path only flags the goal with a warning.
    if (ownEventCurrency) { return { kind: 'event', eventInstanceGuid: this.sourceEventInstanceGuid(source) }; }
    return undefined;
  }

  static windowStart(window: GoalWindow): DateTime | undefined {
    return window.kind === 'upcoming' ? window.startDate : undefined;
  }

  static windowEnd(window: GoalWindow): DateTime | undefined {
    return window.kind === 'limited' || window.kind === 'upcoming' ? window.endDate : undefined;
  }

  static nodeWindow(node: INode): GoalWindow {
    const tree = node.root?.tree ?? node.tree;
    if (!tree) { return { kind: 'unavailable' }; }
    if (tree.permanent) { return { kind: 'permanent' }; }

    if (tree.travelingSpirit) {
      return this.periodWindow(tree.travelingSpirit, `Traveling Spirit: ${tree.travelingSpirit.spirit?.name ?? ''}`.trim());
    }
    if (tree.specialVisitSpirit) {
      return this.periodWindow(tree.specialVisitSpirit.visit, tree.specialVisitSpirit.visit?.name || 'Special Visit');
    }
    if (tree.eventInstanceSpirit) {
      const instance = tree.eventInstanceSpirit.eventInstance;
      return this.periodWindow(instance, instance?.name ?? instance?.event?.name ?? 'Event');
    }

    const spirit = tree.spirit;
    if (!spirit) { return { kind: 'unavailable' }; }
    // Season currency and ultimates on the guide's tree are only obtainable while the season runs.
    if (spirit.type === 'Season' || node.sc || node.sh || node.item?.group === 'Ultimate') {
      return spirit.season ? this.periodWindow(spirit.season, spirit.season.name) : { kind: 'unavailable' };
    }
    if (PERMANENT_SPIRIT_TYPES.has(spirit.type) && this.isCurrentTree(spirit, tree)) {
      return { kind: 'permanent' };
    }
    return { kind: 'unavailable', label: spirit.name };
  }

  static shopWindow(shop: IShop | undefined): GoalWindow {
    if (!shop) { return { kind: 'unavailable' }; }
    if (shop.event) { return this.periodWindow(shop.event, shop.event.name ?? shop.event.event?.name ?? 'Event'); }
    if (shop.season) { return this.periodWindow(shop.season, shop.season.name); }
    if (shop.date && shop.endDate) { return this.periodWindow(shop as IPeriod, shop.name ?? 'Shop'); }
    return { kind: 'permanent' };
  }

  /**
   * Projects when each goal can be afforded. Goals are paid for in order, so a goal's date includes
   * the costs of every goal above it; spirit-tree nodes shared between goals are only paid once.
   * Nothing is collected today or on skipped days.
   */
  static project(
    items: ReadonlyArray<IItem>,
    buckets: ReadonlyMap<GoalBucketKey, IGoalBucket>,
    today: DateTime,
    skipped: ReadonlySet<string> = new Set()
  ): IGoalPlan {
    const paidNodes = new Map<INode, IGoalProjection>();
    const paidIaps = new Set<IIAP>();
    const needed = new Map<GoalBucketKey, number>();

    const goals = items.map(item => {
      const result: IGoalProjection = { item, cost: CostHelper.create(), price: 0, status: 'owned' };
      if (item.unlocked) { return result; }

      const source = this.resolveSource(item);
      result.source = source;
      if (!source) { result.status = 'unknown'; return result; }

      switch (source.type) {
        case 'node':
          result.includedIn = paidNodes.get(source.node);
          for (const n of NodeHelper.trace(source.node)) {
            if (n.unlocked || n.item?.unlocked) { continue; }
            if (n !== source.node && n.ec) { result.requiresEventCurrency = true; }
            if (paidNodes.has(n)) { continue; }
            if (source.window.kind !== 'unavailable') { paidNodes.set(n, result); }
            CostHelper.add(result.cost, n);
          }
          break;
        case 'list':
          CostHelper.add(result.cost, source.listNode);
          break;
        case 'iap':
          if (!paidIaps.has(source.iap) && !source.iap.bought) {
            if (source.window.kind !== 'unavailable') { paidIaps.add(source.iap); }
            result.price = source.iap.price ?? 0;
          }
          break;
      }

      if (source.window.kind === 'unavailable') { result.status = 'unavailable'; return result; }
      if (source.type === 'iap') { result.status = 'purchase'; return result; }
      if (result.includedIn) { result.status = 'included'; return result; }

      // Currencies are saved independently, so only the pools this goal draws from delay it.
      let collectDays = 0;
      const blockedBy: Array<GoalBucketKey> = [];
      for (const [key, amount] of this.costToBuckets(result.cost)) {
        const total = (needed.get(key) ?? 0) + amount;
        needed.set(key, total);
        const bucket = buckets.get(key) ?? { balance: 0, perDay: 0 };
        const shortfall = total - bucket.balance;
        if (shortfall <= 0) { continue; }
        if (bucket.perDay <= 0) { blockedBy.push(key); continue; }
        collectDays = Math.max(collectDays, Math.ceil(shortfall / bucket.perDay));
      }

      if (blockedBy.length) { result.status = 'never'; result.blockedBy = blockedBy; return result; }
      result.date = this.nthCollectDay(today, collectDays, skipped);
      const start = this.windowStart(source.window)?.setZone(today.zone).startOf('day');
      if (start && start > result.date) {
        result.date = start;
        result.waitsForStart = true;
      }
      result.days = Math.round(result.date.diff(today, 'days').days);
      result.status = result.days ? 'projected' : 'affordable';
      const end = this.windowEnd(source.window);
      result.late = !!end && result.date > end;
      return result;
    });

    this.flagOrder(goals);

    const plans = [...buckets].map(([key, bucket]) => {
      const plan: IGoalBucketPlan = { ...bucket, key, needed: needed.get(key) ?? 0 };
      const shortfall = plan.needed - plan.balance;
      if (shortfall > 0 && plan.perDay > 0) {
        plan.doneDate = this.nthCollectDay(today, Math.ceil(shortfall / plan.perDay), skipped);
      }
      return plan;
    });

    return { goals, buckets: plans };
  }

  /** The n-th day after today that is not skipped, or today when n is 0. */
  static nthCollectDay(today: DateTime, n: number, skipped: ReadonlySet<string>): DateTime {
    let date = today;
    while (n > 0) {
      date = date.plus({ days: 1 });
      if (!skipped.has(date.toFormat(GOAL_DAY_FORMAT))) { n--; }
    }
    return date;
  }

  /** How many days after today, up to and including the given date, are not skipped. */
  static collectDaysUntil(today: DateTime, date: DateTime, skipped: ReadonlySet<string>): number {
    let count = 0;
    for (let d = today.plus({ days: 1 }); d <= date; d = d.plus({ days: 1 })) {
      if (!skipped.has(d.toFormat(GOAL_DAY_FORMAT))) { count++; }
    }
    return count;
  }

  /** Flags limited goals that leave before a limited goal placed above them. */
  private static flagOrder(goals: Array<IGoalProjection>): void {
    const ends = goals.map(g => g.status !== 'owned' && g.status !== 'unavailable' && g.source
      ? this.windowEnd(g.source.window) : undefined);
    goals.forEach((goal, i) => {
      const end = ends[i];
      if (!end) { return; }
      const higher = goals.slice(0, i).filter((_, j) => !!ends[j] && ends[j] > end);
      if (higher.length) { goal.beforeHigher = higher; }
    });
  }

  private static costToBuckets(cost: ICost): Array<[GoalBucketKey, number]> {
    const entries: Array<[GoalBucketKey, number]> = [];
    if (cost.c) { entries.push(['c', cost.c]); }
    if (cost.h) { entries.push(['h', cost.h]); }
    if (cost.ac) { entries.push(['ac', cost.ac]); }
    return entries;
  }

  private static isSeasonSpiritNode(node: INode): boolean {
    return (node.root?.tree ?? node.tree)?.spirit?.type === 'Season';
  }

  private static sourceSeasonGuid(source: GoalSource): string | undefined {
    switch (source.type) {
      case 'node': return (source.node.root?.tree ?? source.node.tree)?.spirit?.season?.guid;
      case 'list': return source.listNode.itemList?.shop?.season?.guid;
      case 'iap': return source.iap.shop?.season?.guid;
    }
  }

  private static sourceEventInstanceGuid(source: GoalSource): string | undefined {
    switch (source.type) {
      case 'node': return (source.node.root?.tree ?? source.node.tree)?.eventInstanceSpirit?.eventInstance?.guid;
      case 'list': return source.listNode.itemList?.shop?.event?.guid;
      case 'iap': return source.iap.shop?.event?.guid;
    }
  }

  private static periodWindow(period: IPeriod | undefined, label: string): GoalWindow {
    if (!period) { return { kind: 'unavailable', label }; }
    if (DateHelper.isActivePeriod(period)) { return { kind: 'limited', label, endDate: period.endDate }; }
    if (period.date > DateTime.now()) { return { kind: 'upcoming', label, startDate: period.date, endDate: period.endDate }; }
    return { kind: 'unavailable', label };
  }

  /** Reworked spirits keep their old trees around; only the latest non-limited revision can be visited. */
  private static isCurrentTree(spirit: ISpirit, tree: ISpiritTree): boolean {
    const current = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType !== 'Limited') ?? spirit.tree;
    return current === tree;
  }
}
