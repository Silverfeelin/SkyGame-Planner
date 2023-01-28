import { IConfig, IGuid } from "./base.interface";
import { INode } from "./node.interface";

export interface ISpiritTreeConfig extends IConfig<ISpiritTree> {}

export interface ISpiritTree extends IGuid {
  /* References */
  node: INode;
}
