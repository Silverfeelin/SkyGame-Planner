import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { NodeHelper } from './node-helper';
import { INode } from '@app/interfaces/node.interface';
import { IItem } from '@app/interfaces/item.interface';

export class TreeHelper {
  static getNodes(tree?: ISpiritTree): Array<INode> {
    if (!tree) {
      return [];
    }
    if (tree.node) {
      return NodeHelper.all(tree.node);
    }
    if (tree.tiers?.length) {
      return tree.tiers.flatMap(t => t.nodes.flat()).filter(n => n) as Array<INode>;
    }
    return [];
  }

  static getItems(tree?: ISpiritTree, includeHidden?: boolean): Array<IItem> {
    if (!tree) { return []; }
    const itemSet = new Set<IItem>();
    this.getNodes(tree).filter(n => n.item).forEach(n => {
      itemSet.add(n.item!);
      includeHidden && n.hiddenItems?.forEach(i => itemSet.add(i));
    });
    return [...itemSet];
  }
}
