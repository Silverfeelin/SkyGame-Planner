import { INode, ISeason, ISpiritTree, ItemType } from 'skygame-data';
import { TreeHelper } from './tree-helper';

export const TIER_COST: ReadonlyArray<number> = [0, 40, 60, 80, 100];
export const TIER_CUMULATIVE: ReadonlyArray<number> = [0, 40, 100, 180, 280];
export const MAX_FRIENDSHIP = 280;
/** A spirit adventure (accompanying a spirit) always gives 10 friendship. */
export const ACCOMPANY_POINTS = 10;
/** Friendship per node is fractional (e.g. 40 / 3), so sums need a tolerance. */
export const FRIENDSHIP_EPSILON = 0.01;

/** Friendship structure of a season's tiered spirit trees. */
export interface ISeasonFriendship {
  trees: ReadonlyArray<ISpiritTree>;
  nodes: ReadonlyArray<INode>;
  /** Nodes per tier, indexed by tree then tier. */
  tierNodes: ReadonlyArray<ReadonlyArray<ReadonlyArray<INode>>>;
  nodeTier: ReadonlyMap<string, number>;
  nodeTree: ReadonlyMap<string, number>;
  /** Friendship per node; nodes in a tier share the cost of the next tier. */
  nodeValues: { readonly [guid: string]: number };
}

export class SeasonFriendshipHelper {
  static isPassItem(node: INode): boolean {
    return node.item?.group === 'SeasonPass' || node.item?.group === 'Ultimate';
  }

  static isAccompanyNode(node: INode): boolean {
    return node.item?.type === ItemType.Special && !!node.item.name?.startsWith('Accompany ');
  }

  static model(season: ISeason | undefined): ISeasonFriendship {
    const trees = (season?.spirits.filter(s => s.type === 'Season').map(s => s.tree).filter(t => t?.tier) ?? []) as Array<ISpiritTree>;
    const tierNodes = trees.map(tree => TreeHelper.getTiers(tree).map(tier => tier.rows.flat().filter(n => n) as Array<INode>));
    const nodeTier = new Map<string, number>();
    const nodeTree = new Map<string, number>();
    const nodeValues: { [guid: string]: number } = {};

    tierNodes.forEach((tiers, iTree) => {
      tiers.forEach((nodes, iTier) => {
        nodes.forEach(n => { nodeTier.set(n.guid, iTier); nodeTree.set(n.guid, iTree); });
        if (iTier >= TIER_COST.length - 1) { return; }
        // Free items give friendship too, except accompanying (counted separately) and the Season Pass gifts.
        const earning = nodes.filter(n => n.sc || (!this.isAccompanyNode(n) && !this.isPassItem(n)));
        earning.forEach(n => nodeValues[n.guid] = TIER_COST[iTier + 1] / earning.length);
      });
    });

    return {
      trees,
      nodes: trees.flatMap(t => TreeHelper.getNodes(t)).filter(n => n) as Array<INode>,
      tierNodes, nodeTier, nodeTree, nodeValues
    };
  }

  /** Friendship from owned items only. */
  static itemPoints(model: ISeasonFriendship, iTree: number): number {
    return model.tierNodes[iTree].flat().reduce((sum, n) => sum + (n.unlocked ? model.nodeValues[n.guid] ?? 0 : 0), 0);
  }

  static isReached(friendship: number, points: number): boolean {
    return friendship >= points - FRIENDSHIP_EPSILON;
  }
}
