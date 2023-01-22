import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { IWiki } from "./wiki.interface";

export interface IWingedLightConfig extends IConfig<IWingedLight> {}

export interface IWingedLight extends IGuid {
  description: string;

  /* References */
  area?: IArea;

  _wiki?: IWiki;
}
