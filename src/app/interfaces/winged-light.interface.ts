import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { IMapData } from './map-data.interface';
import { IWiki } from "./wiki.interface";

export interface IWingedLightConfig extends IConfig<IWingedLight> {}

export interface IWingedLight extends IGuid {
  name?: string;
  description?: string;
  mapData?: IMapData;

  /// References ///
  area: IArea;

  /// Progress ///
  unlocked?: boolean;

  _wiki?: IWiki;
}
