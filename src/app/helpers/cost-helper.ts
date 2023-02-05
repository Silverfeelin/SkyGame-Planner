import { ICost } from "../interfaces/cost.interface";

export class CostHelper {
  static isEmpty(value: ICost): boolean {
    return !value.c && !value.h
      && !value.sc && !value.sh
      && !value.ac;
  }

  static add(target: ICost, value: ICost): void {
    if (value.c) { target.c = (target.c || 0) + value.c; }
    if (value.h) { target.h = (target.h || 0) + value.h; }
    if (value.sc) { target.sc = (target.sc || 0) + value.sc; }
    if (value.sh) { target.sh = (target.sh || 0) + value.sh; }
    if (value.ac) { target.ac = (target.ac || 0) + value.ac; }
  }

  static subtract(target: ICost, value: ICost): void {
    if (value.c) { target.c = (target.c || 0) - value.c; }
    if (value.h) { target.h = (target.h || 0) - value.h; }
    if (value.sc) { target.sc = (target.sc || 0) - value.sc; }
    if (value.sh) { target.sh = (target.sh || 0) - value.sh; }
    if (value.ac) { target.ac = (target.ac || 0) - value.ac; }
  }
}
