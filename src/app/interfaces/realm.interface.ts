import { IConfig, IGuid } from "./base.interface";
import { IArea } from "./area.interface";
import { IWiki } from "./wiki.interface";
import { IMapData } from './map-data.interface';
import { ISpirit } from './spirit.interface';

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
  constellation?: IRealmConstellation;
  elder?: ISpirit;

  /// Metadata ///
  mapData?: IMapData;
  _wiki?: IWiki;
}

export interface IRealmConstellation {
  imageUrl: string;
  icons: Array<IRealmConstellationIcon>;
}

export interface IRealmConstellationIcon {
  imageUrl: string;
  position: [number, number];
  spirit?: ISpirit;
  flag?: boolean;
}
