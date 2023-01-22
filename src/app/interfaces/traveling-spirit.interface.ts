import { IConfig, IGuid } from "./base.interface";
import { IConstellation } from "./constellation.interface";
import { IDate } from "./date.interface";
import { ISpirit } from "./spirit.interface";

export interface ITravelingSpiritConfig extends IConfig<ITravelingSpirit> {}

export interface ITravelingSpirit extends IGuid {
  date: Date | IDate;
  endDate: Date | IDate;

  /* References */
  spirit?: ISpirit;
  constellation?: IConstellation;
}
