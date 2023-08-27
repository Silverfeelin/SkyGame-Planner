export class ArrayHelper {
  static union<T>(...arrays: Array<Array<T>>): Array<T> {
    const result = new Set<T>();
    arrays.forEach(a => a.forEach(i => result.add(i)));
    return Array.from(result);
  }

  static intersection<T>(...arrays: Array<Array<T>>): Array<T> {
    const countMap = new Map<T, number>();

    // Count occurrences of each item.
    for (const array of arrays) {
      for (const item of array) {
        countMap.set(item, (countMap.get(item) || 0) + 1);
      }
    }

    // Filter items that occur in all arrays.
    const result: Array<T> = [];
    countMap.forEach((count, item) => {
      if (count < arrays.length) { return; }
      result.push(item);
    });

    return result;
  }
}
