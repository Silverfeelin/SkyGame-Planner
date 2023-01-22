import { IArea } from "./area.interface";
import { IConfig, IGuid } from "./base.interface";
import { IItem } from "./item.interface";

export interface IConnectionConfig extends IConfig<IConnection> {}

export interface IConnection extends IGuid {
  from?: IArea;
  item?: IItem;
  to: IArea;
}
