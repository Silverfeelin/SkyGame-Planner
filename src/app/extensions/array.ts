export {};

declare global {
  interface Array<T> {
    findLast<T>(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined;
  }
}

Array.prototype.findLast = function <T>(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
  for (let i = this.length - 1; i >= 0; i--) {
    const item = this[i];
    if (predicate(item, i, this)) { return item; }
  }
  return undefined;
}
