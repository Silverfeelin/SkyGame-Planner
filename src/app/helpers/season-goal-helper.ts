import { DateTime } from 'luxon';
import { INode } from 'skygame-data';
import { ACCOMPANY_POINTS, FRIENDSHIP_EPSILON, ISeasonFriendship, MAX_FRIENDSHIP, SeasonFriendshipHelper, TIER_CUMULATIVE } from './season-friendship-helper';

export type SeasonGoalStatus =
  | 'affordable'
  | 'projected'
  /** Can't be bought before the season ends. */
  | 'unreachable'
  /** Needs the Season Pass, which the user doesn't have. */
  | 'pass';

export interface ISeasonGoal {
  node: INode;
  iTree: number;
  tier: number;
  status: SeasonGoalStatus;
  date?: DateTime;
  /** Calendar days from the first day played until the goal can be bought. */
  days?: number;
  outOfOrder?: ISeasonGoalOutOfOrder;
}

/** A goal placed after a higher tier goal of the same spirit. */
export interface ISeasonGoalOutOfOrder {
  /** First goal above it on the same spirit with a higher tier. */
  before: ISeasonGoal;
  /** Buying it gives friendship, so leaving it later can hold up the goal above. */
  givesFriendship: boolean;
}

export interface ISeasonGoalContext {
  friendship: ISeasonFriendship;
  /** Friendship each tree has now, indexed like {@link ISeasonFriendship.trees}. */
  current: ReadonlyArray<number>;
  candles: number;
  candlesPerDay: number;
  hasPass: boolean;
  /** First day to play: today, or the start of an upcoming season. */
  start: DateTime;
  end: DateTime;
  /** Today's season candles are already in the balance. */
  checkedIn: boolean;
  /** Today's accompany is already in {@link current}. */
  accompanied: boolean;
}

export interface ISeasonGoalPlan {
  goals: Array<ISeasonGoal>;
  /** Tree to accompany on the first day, unless that day's accompany is already logged. */
  accompanyFirst?: number;
  /** Tree that needs accompanying per day, keyed by ISO date. Days without an entry need none. */
  accompanies: Map<string, number>;
}

export class SeasonGoalHelper {
  /**
   * Projects goals day by day until the season ends. Goals are bought strictly in order, once their
   * spirit's friendship reaches their tier and enough season candles are saved. The accompanies the goals
   * need are done as soon as possible, in goal order, since friendship counts towards any later tier.
   */
  static project(nodes: ReadonlyArray<INode>, ctx: ISeasonGoalContext): ISeasonGoalPlan {
    const model = ctx.friendship;
    const friendship = [...ctx.current];
    const reached = (g: ISeasonGoal) => SeasonFriendshipHelper.isReached(friendship[g.iTree], TIER_CUMULATIVE[g.tier]);

    const goals = nodes.map<ISeasonGoal>(node => ({
      node,
      iTree: model.nodeTree.get(node.guid) ?? 0,
      tier: model.nodeTier.get(node.guid) ?? 0,
      status: SeasonFriendshipHelper.isPassItem(node) && !ctx.hasPass ? 'pass' : 'unreachable'
    }));

    const pending = goals.filter(g => g.status === 'unreachable');
    const queue = this.accompanyQueue(pending, ctx);
    let candles = ctx.candles;
    let next = 0;
    let queued = 0;
    let accompanyFirst: number | undefined;
    const accompanies = new Map<string, number>();

    const buy = (date: DateTime) => {
      for (; next < pending.length; next++) {
        const goal = pending[next];
        const sc = goal.node.sc ?? 0;
        if (!reached(goal) || candles < sc) { return; }
        candles -= sc;
        friendship[goal.iTree] += model.nodeValues[goal.node.guid] ?? 0;
        goal.date = date;
        goal.days = Math.round(date.diff(ctx.start, 'days').days);
        goal.status = goal.days ? 'projected' : 'affordable';
      }
    };

    for (let date = ctx.start; date <= ctx.end && next < pending.length; date = date.plus({ days: 1 })) {
      const isFirst = date.hasSame(ctx.start, 'day');
      if (!isFirst || !ctx.checkedIn) { candles += ctx.candlesPerDay; }
      buy(date);
      if ((isFirst && ctx.accompanied) || queued >= queue.length) { continue; }

      const iTree = queue[queued++];
      friendship[iTree] = Math.min(MAX_FRIENDSHIP, friendship[iTree] + ACCOMPANY_POINTS);
      accompanies.set(date.toISODate()!, iTree);
      if (isFirst) { accompanyFirst = iTree; }
      buy(date);
    }

    this.flagOrder(goals, model);
    return { goals, accompanyFirst, accompanies };
  }

  /**
   * Trees to accompany, one entry per day, in goal order. Each goal only needs what the goals before it
   * on the same spirit and the accompanies queued so far don't already cover.
   */
  private static accompanyQueue(pending: ReadonlyArray<ISeasonGoal>, ctx: ISeasonGoalContext): Array<number> {
    const friendship = [...ctx.current];
    const queue: Array<number> = [];
    for (const goal of pending) {
      const short = TIER_CUMULATIVE[goal.tier] - friendship[goal.iTree];
      const days = Math.max(0, Math.ceil(short / ACCOMPANY_POINTS - FRIENDSHIP_EPSILON));
      for (let i = 0; i < days; i++) { queue.push(goal.iTree); }
      friendship[goal.iTree] = Math.min(MAX_FRIENDSHIP,
        friendship[goal.iTree] + days * ACCOMPANY_POINTS + (ctx.friendship.nodeValues[goal.node.guid] ?? 0));
    }
    return queue;
  }

  /**
   * Moves each goal in front of the first goal above it on the same spirit with a higher tier,
   * keeping everything else in place. Lower tiers either give the friendship the higher tier needs,
   * or are free and can simply be collected sooner.
   */
  static fixOrder(goals: ReadonlyArray<ISeasonGoal>): Array<ISeasonGoal> {
    const result: Array<ISeasonGoal> = [];
    for (const goal of goals) {
      const at = goal.status === 'pass' ? -1 : result.findIndex(h => h.status !== 'pass' && h.iTree === goal.iTree && h.tier > goal.tier);
      at < 0 ? result.push(goal) : result.splice(at, 0, goal);
    }
    return result;
  }

  private static flagOrder(goals: ReadonlyArray<ISeasonGoal>, model: ISeasonFriendship): void {
    const ordered = goals.filter(g => g.status !== 'pass');
    ordered.forEach((goal, i) => {
      const before = ordered.slice(0, i).find(h => h.iTree === goal.iTree && h.tier > goal.tier);
      if (before) { goal.outOfOrder = { before, givesFriendship: (model.nodeValues[goal.node.guid] ?? 0) > 0 }; }
    });
  }
}
