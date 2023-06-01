import { ICost } from "../interfaces/cost.interface";

export class CostHelper {
  static create(): ICost {
    return {
      c: 0, h: 0, sc: 0, sh: 0, ac: 0, ec: 0
    }
  }
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
    if (value.ec) { target.ec = (target.ec || 0) + value.ec; }
  }

  static subtract(target: ICost, value: ICost): void {
    if (value.c) { target.c = (target.c || 0) - value.c; }
    if (value.h) { target.h = (target.h || 0) - value.h; }
    if (value.sc) { target.sc = (target.sc || 0) - value.sc; }
    if (value.sh) { target.sh = (target.sh || 0) - value.sh; }
    if (value.ac) { target.ac = (target.ac || 0) - value.ac; }
    if (value.ec) { target.ec = (target.ec || 0) - value.ec; }
  }
}
