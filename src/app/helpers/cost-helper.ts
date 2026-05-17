import { ICost } from 'skygame-data';

export class CostHelper {
  /** Creates a simple Cost object with all currencies set to 0. */
  static create(): ICost {
    return { c: 0, h: 0, sc: 0, sh: 0, ac: 0, ec: 0 };
  }

  /** Creates a clone of the provided cost. Other properties are ignored. */
  static clone(value: ICost): ICost {
    const cost: ICost = {};
    if (typeof value.c === 'number') { cost.c = value.c; }
    if (typeof value.h === 'number') { cost.h = value.h; }
    if (typeof value.sc === 'number') { cost.sc = value.sc; }
    if (typeof value.sh === 'number') { cost.sh = value.sh; }
    if (typeof value.ac === 'number') { cost.ac = value.ac; }
    if (typeof value.ec === 'number') { cost.ec = value.ec; }
    return cost;
  }

  /** Returns true if there are no currencies <> 0.  */
  static isEmpty(value: ICost): boolean {
    return !value.c && !value.h
      && !value.sc && !value.sh
      && !value.ec && !value.ac;
  }

  /** Clears all cost values by deleting the keys. Returns a reference to the object. */
  static clear(value: ICost): ICost {
    delete value.c;
    delete value.h;
    delete value.sc;
    delete value.sh;
    delete value.ac;
    delete value.ec;

    return value;
  }

  /** Adds costs together in-place. Returns a reference to the first object. */
  static add(target: ICost, ...values: Array<ICost>): ICost {
    for (const value of values) {
      if (!value) { continue; }
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
      if (!value) { continue; }
      if (value.c) { target.c = (target.c || 0) - value.c; }
      if (value.h) { target.h = (target.h || 0) - value.h; }
      if (value.sc) { target.sc = (target.sc || 0) - value.sc; }
      if (value.sh) { target.sh = (target.sh || 0) - value.sh; }
      if (value.ac) { target.ac = (target.ac || 0) - value.ac; }
      if (value.ec) { target.ec = (target.ec || 0) - value.ec; }
    }

    return target;
  }

  /** Multiplies costs in-place. Returns a reference to the first object. */
  static multiply(target: ICost, factor: number | ICost): ICost {
    const costFactor: ICost = typeof factor === 'number' ? {
      c: factor, h: factor, sc: factor, sh: factor, ac: factor, ec: factor
    } : factor;

    if (target.c) target.c *= costFactor.c ?? 1;
    if (target.h) target.h *= costFactor.h ?? 1;
    if (target.sc) target.sc *= costFactor.sc ?? 1;
    if (target.sh) target.sh *= costFactor.sh ?? 1;
    if (target.ac) target.ac *= costFactor.ac ?? 1;
    if (target.ec) target.ec *= costFactor.ec ?? 1;
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

  static percentage(value: ICost, compare: ICost): ICost {
    const calc = (a?: number, b?: number) => b ? Math.max(0, Math.min(100, Math.round((a || 0) / b * 100))) : 100;
    return {
      c: calc(value.c, compare.c),
      h: calc(value.h, compare.h),
      sc: calc(value.sc, compare.sc),
      sh: calc(value.sh, compare.sh),
      ac: calc(value.ac, compare.ac),
      ec: calc(value.ec, compare.ec)
    };
  }
}
