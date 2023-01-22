import { IConfig, IGuid } from "./base.interface";
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";

export interface ISeasonConfig extends IConfig<ISeason> {}

export interface ISeason extends IGuid {
  name: string;
  shortName: string;
  year: number;
  start: Date;
  end: Date;
  spirits: Array<ISpirit>;
  _wiki?: IWiki;
}
