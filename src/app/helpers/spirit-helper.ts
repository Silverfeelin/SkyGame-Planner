import { ISpiritTree } from "../interfaces/spirit-tree.interface";
import { ISpirit } from "../interfaces/spirit.interface";

export class SpiritHelper {
  static getTrees(spirit: ISpirit): Array<ISpiritTree> {
    const treeDates: Array<{ date: Date, tree: ISpiritTree}> = [];

    // Add all trees that need sorting.
    spirit.ts?.forEach(t => {
      treeDates.push({ date: t.date as Date, tree: t.tree });
    });
    spirit.returns?.forEach(r => {
      treeDates.push({ date: r.return.date as Date, tree: r.tree });
    });

    // Sort TS and revisits by date.
    treeDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Combine spirit base tree with sorted trees.
    const trees: Array<ISpiritTree> = [];
    if (spirit.tree) { trees.push(spirit.tree); }
    trees.push(...treeDates.map(t => t.tree));

    return trees;
  }
}
