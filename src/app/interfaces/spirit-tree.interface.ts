import { DateTime } from 'luxon';
import { IConfig, IGuid } from "./base.interface";
import { IEventInstanceSpirit } from "./event.interface";
import { INode } from "./node.interface";
import { IReturningSpirit } from "./returning-spirits.interface";
import { ISpirit } from "./spirit.interface";
import { ITravelingSpirit } from "./traveling-spirit.interface";

export interface ISpiritTreeConfig extends IConfig<ISpiritTree> {}

export interface ISpiritTree extends IGuid {
  name?: string;
  draft?: boolean;

  /// References ///
  permanent?: boolean | string;
  node?: INode;
  tier?: ISpiritTreeTier;
  ts?: ITravelingSpirit;
  visit?: IReturningSpirit;
  spirit?: ISpirit;
  eventInstanceSpirit?: IEventInstanceSpirit;
}

export interface IRevisedSpiritTree extends ISpiritTree {
  revisionType: 'DuringSeason' | 'AfterSeason' | 'Limited';
}

export interface ISpiritTreeTier extends IGuid {
  /// References ///
  spiritTree?: ISpiritTree;
  prev?: ISpiritTreeTier;
  next?: ISpiritTreeTier;
  root?: ISpiritTreeTier;
  nodes: Array<[INode?, INode?, INode?]>;
}
