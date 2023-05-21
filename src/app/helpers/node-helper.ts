import { IItem } from "../interfaces/item.interface";
import { INode } from "../interfaces/node.interface";

export class NodeHelper {
  /** Finds the first node that satisfies the predicate.
  * @param node Node to start searching from.
  * @param predicate Function to search for.
  * @returns First node that matches or undefined.
  */
  static find(node: INode, predicate: (node: INode) => boolean): INode | undefined {
    if (predicate(node)) { return node; }
    return node?.nw && this.find(node.nw, predicate)
      || node?.ne && this.find(node.ne, predicate)
      || node?.n && this.find(node.n, predicate)
      || undefined;
  }

  /** Gets the root node from a given node. */
  static getRoot(node?: INode): INode | undefined {
    if (!node) { return node; }
    while (node.prev) { node = node.prev; }
    return node;
  }

  /** Returns all nodes from the given node.
  * @param node Node to start from.
  * @param nodes Array to add items to.
  * @returns `nodes` or new array with all nodes.
  */
  static all(node?: INode, nodes?: Array<INode>): Array<INode> {
    nodes ??= [];
    if (!node) { return nodes; }

    nodes.push(node);
    if (node.nw) { this.all(node.nw , nodes); }
    if (node.ne) { this.all(node.ne , nodes); }
    if (node.n) { this.all(node.n , nodes); }
    return nodes;
  }

  static getItems(node?: INode): Array<IItem> {
    const itemSet = new Set<IItem>();
    this.all(node).filter(n => n.item).forEach(n => itemSet.add(n.item!));
    return [...itemSet];
  }
}
