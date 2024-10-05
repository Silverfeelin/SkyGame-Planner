import { IConfig, IGuid } from "./base.interface";
import { IMapData } from './map-data.interface';
import { IMapShrine } from './map-shrine.interface';
import { IRealm } from "./realm.interface";
import { IReturningSpirits } from './returning-spirits.interface';
import { ISpirit } from "./spirit.interface";
import { IWiki } from "./wiki.interface";
import { IWingedLight } from "./winged-light.interface";

export interface IAreaConfig extends IConfig<IArea> {}

export interface IArea extends IGuid {
  name: string;
  mapData?: IMapData;

  /** Area image. */
  imageUrl?: string;
  imagePosition?: string;

  /// References ///
  realm: IRealm;
  spirits?: Array<ISpirit>;
  wingedLights?: Array<IWingedLight>;
  rs?: Array<IReturningSpirits>;
  connections?: Array<IAreaConnection>;
  mapShrines?: Array<IMapShrine>;

  _wiki?: IWiki;
}

export interface IAreaConnection {
  area: IArea;
}
