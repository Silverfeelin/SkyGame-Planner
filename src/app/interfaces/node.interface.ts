import { IConfig, IGuid } from "./base.interface";
import { IConstellation } from "./constellation.interface";
import { IItem } from "./item.interface";

export interface INodeConfig extends IConfig<INode> {}

export interface INode extends IGuid {
  // #region Costs
  /** Cost in candles. */
  c?: number;
  /** Cost in hearts. */
  h?: number;
  /** Cost in seasonal candles. */
  sc?: number;
  /** Cost in seasonal hearts. */
  sh?: number;
  /** Cost in ascended candles. */
  ac?: number;
  // #endregion

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
