import { IConfig, IGuid } from "./base.interface";
import { ISpiritTree } from "./spirit-tree.interface";
import { ICost } from "./cost.interface";
import { IItem } from "./item.interface";

export interface INodeConfig extends IConfig<INode> {}

export interface INode extends IGuid, ICost {
  // #region References
  /** Item unlocked through this node. */
  item?: IItem;
  /** Items unlocked through this node that are not visible in the node. Generally ones added retroactively. */
  hiddenItems?: Array<IItem>;

  /**
   * Spirit tree containing this node.
   * @remarks For normal spirit trees only the first node has this reference.
   * Other nodes have a reference to their `prev` node.
   * For spirit trees with friendship tiers, every node has this reference.
   */
  spiritTree?: ISpiritTree;
  /** Node north west of this node. */
  nw?: INode;
  /** Node north east of this node. */
  ne?: INode;
  /** Node north of this node. */
  n?: INode;
  /** Previous node. */
  prev?: INode;
  /**
   * Root node.
   * @remarks Can be a self-reference if this is the root node.
   * For spirit trees with friendship tiers, every node is its own root.
   */
  root?: INode;
  // #endregion

  /// Progress ///
  unlocked?: boolean;
}

/** A node with spirit tree tier metadata. */
export interface ITierNode extends INode {
  tier?: number;
}
