import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { ISeason } from "./season.interface";
import { ITravelingSpirit } from "./traveling-spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISpiritConfig extends IConfig<ISpirit> {}

export interface ISpirit extends IGuid {
  name: string;

  /* References */
  area?: IArea;
  season?: ISeason;
  ts?: Array<ITravelingSpirit>;

  /* Progress */
  relived?: boolean;

  _wiki?: IWiki
}
