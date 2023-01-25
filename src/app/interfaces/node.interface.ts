import { IConfig, IGuid } from "./base.interface";
import { IConstellation } from "./constellation.interface";
import { ICost } from "./cost.interface";
import { IItem } from "./item.interface";

export interface INodeConfig extends IConfig<INode> {}

export interface INode extends IGuid, ICost {
  // #region References
  /** Item unlocked through this node. */
  item?: IItem;
  /** Constellation containing this node */
  constellation?: IConstellation;
  /** Node north west of this node. */
  nw?: INode;
  /** Node north east of this node. */
  ne?: INode;
  /** Node north of this node. */
  n?: INode;
  /** Previous node. */
  prev?: INode;
  // #endregion

  /* Progress */
  unlocked?: boolean;
}
