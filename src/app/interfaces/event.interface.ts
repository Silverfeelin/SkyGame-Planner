import { IConfig, IGuid } from "./base.interface";

export interface IEventConfig extends IConfig<IEvent> {}

export interface IEvent extends IGuid {
  name: string;
}
