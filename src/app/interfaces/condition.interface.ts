import { IPeriod } from "./date.interface";
import { IRealm } from "./realm.interface";

export interface ICondition {
  period?: IPeriod;
  players?: number;
  gate?: IGateCondition;
}

export interface IGateCondition {
  realm: IRealm;
  spirits: number;
}
