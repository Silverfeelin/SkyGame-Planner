import { IConfig, IGuid } from "./base.interface";
import { IArea } from "./area.interface";
import { IWiki } from "./wiki.interface";
import { IMapData } from './map-data.interface';

export interface IRealmConfig extends IConfig<IRealm> {
  _wiki: IWiki;
}

export interface IRealm extends IGuid {
  name: string;
  shortName: string;

  /** Path to realm overview image. */
  imageUrl?: string;
  imagePosition?: string;
  /** Hidden from main view. */
  hidden?: boolean;

  /// References ///
  areas?: Array<IArea>;

  /// Metadata ///
  mapData?: IMapData;
  _wiki?: IWiki;
}
