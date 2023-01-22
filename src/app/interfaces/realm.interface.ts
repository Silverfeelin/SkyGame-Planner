import { IConfig, IGuid } from "./base.interface";
import { IArea } from "./area.interface";
import { IWiki } from "./wiki.interface";

export interface IRealmConfig extends IConfig<IRealm> {
  _wiki: IWiki;
}

export interface IRealm extends IGuid {
  name: string;
  shortName: string;

  /* References */
  areas?: Array<IArea>;

  _wiki?: IWiki;
}
