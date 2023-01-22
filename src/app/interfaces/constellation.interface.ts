import { IConfig, IGuid } from "./base.interface";
import { INode } from "./node.interface";

export interface IConstellationConfig extends IConfig<IConstellation> {}

export interface IConstellation extends IGuid {
  /* References */
  node: INode;
}
