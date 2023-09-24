import { ICost } from "../interfaces/cost.interface";

export class CostHelper {
  /** Creates a simple Cost object with all currencies set to 0. */
  static create(): ICost {
    return {
      c: 0, h: 0, sc: 0, sh: 0, ac: 0, ec: 0
    }
  }

  /** Returns true if there are no currencies <> 0.  */
  static isEmpty(value: ICost): boolean {
    return !value.c && !value.h
      && !value.sc && !value.sh
      && !value.ec && !value.ac;
  }

  /** Adds costs together in-place. Returns a reference to the first object. */
  static add(target: ICost, ...values: Array<ICost>): ICost {
    for (const value of values) {
      if (value.c) { target.c = (target.c || 0) + value.c; }
      if (value.h) { target.h = (target.h || 0) + value.h; }
      if (value.sc) { target.sc = (target.sc || 0) + value.sc; }
      if (value.sh) { target.sh = (target.sh || 0) + value.sh; }
      if (value.ac) { target.ac = (target.ac || 0) + value.ac; }
      if (value.ec) { target.ec = (target.ec || 0) + value.ec; }
    }

    return target;
  }

  /** Subtracts costs in-place. Returns a reference to the first object. */
  static subtract(target: ICost, ...values: Array<ICost>): ICost {
    for (const value of values) {
      if (value.c) { target.c = (target.c || 0) - value.c; }
      if (value.h) { target.h = (target.h || 0) - value.h; }
      if (value.sc) { target.sc = (target.sc || 0) - value.sc; }
      if (value.sh) { target.sh = (target.sh || 0) - value.sh; }
      if (value.ac) { target.ac = (target.ac || 0) - value.ac; }
      if (value.ec) { target.ec = (target.ec || 0) - value.ec; }
    }

    return target;
  }

  /** Inverts costs in-place. Returns a reference to the same object. */
  static invert(target: ICost): ICost {
    if (target.c) target.c = -target.c;
    if (target.h) target.h = -target.h;
    if (target.sc) target.sc = -target.sc;
    if (target.sh) target.sh = -target.sh;
    if (target.ac) target.ac = -target.ac;
    if (target.ec) target.ec = -target.ec;

    return target;
  }
}
