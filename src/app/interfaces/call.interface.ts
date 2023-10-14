import { IConfig, IGuid } from "./base.interface";

export interface ICallConfig extends IConfig<ICall> {

}

export interface ICall extends IGuid {
  name: string;
  sounds?: Array<string>;
}
