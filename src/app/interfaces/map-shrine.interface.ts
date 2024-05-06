import { IConfig, IGuid } from "./base.interface";
import { IArea } from './area.interface';
import { IMapData } from './map-data.interface';
import { IWiki } from "./wiki.interface";

export interface IMapShrineConfig extends IConfig<IMapShrine> {}

export interface IMapShrine extends IGuid {
  description?: string;
  imageUrl?: string;
  mapData?: IMapData;

  /// References ///
  area: IArea;

  _wiki?: IWiki;
}
