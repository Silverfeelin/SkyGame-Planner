import { nanoid } from 'nanoid';
import { IItem, ItemType } from "../interfaces/item.interface";
import { INode, ITierNode } from "../interfaces/node.interface";

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
    if (node.nw) { this.all(node.nw, nodes); }
    if (node.ne) { this.all(node.ne, nodes); }
    if (node.n) { this.all(node.n, nodes); }
    return nodes;
  }

  /**
   * Returns all nodes from the given node with their spirit tier.
   * Tiers are determined by wing buff unlocks, starting at 0 and incrementing at each wing buff (inclusive).
   */
  static allTier(node?: INode, tier?: number, nodes?: Array<ITierNode>): Array<ITierNode> {
    nodes ??= [];
    if (!node) { return nodes; }

    tier ??= 0;
    if (node.item?.type === ItemType.WingBuff) { tier++; }

    nodes.push({ ...node, tier });
    if (node.nw) { this.allTier(node.nw, tier, nodes); }
    if (node.ne) { this.allTier(node.ne, tier, nodes); }
    if (node.n) { this.allTier(node.n, tier, nodes); }
    return nodes;
  }

  /** Gets all items from the node tree.
   * @param node Node to start from.
   * @param includeHidden Include hidden items (see INode.hiddenItems).
   * @returns Array of items.
   */
  static getItems(node?: INode, includeHidden?: boolean): Array<IItem> {
    if (!node) { return []; }
    const itemSet = new Set<IItem>();
    this.all(node).filter(n => n.item).forEach(n => {
      itemSet.add(n.item!);
      includeHidden && n.hiddenItems?.forEach(i => itemSet.add(i));
    });
    return [...itemSet];
  }

  /** Gets all nodes leading up to this node.
   * @param node Target node.
   * @returns Array in order from root node to given node.
   */
  static trace(node?: INode): Array<INode> {
    const nodes: Array<INode> = [];
    while (node) { nodes.push(node); node = node.prev; }
    return nodes.reverse();
  }

  /** Gets all nodes leading up to these nodes.
   * @remarks Nodes are distinct but order is not guaranteed.
   */
  static traceMany(nodes: Array<INode>): Array<INode> {
    const nodeSet = new Set<INode>();
    for (const node of nodes) {
      let n: INode|undefined = node;
      do {
        if (nodeSet.has(n)) { break; }
        nodeSet.add(n);
        n = n.prev;
      } while (n)
    }
    return [...nodeSet];
  }

  static clone(node: INode): INode {
    const newNode: INode = {
      guid: nanoid(10),
      item: node.item,
    };
    if (node.hiddenItems) { newNode.hiddenItems = [...node.hiddenItems]; }
    if (node.c) { newNode.c = node.c; }
    if (node.h) { newNode.h = node.h; }
    if (node.sc) { newNode.sc = node.sc; }
    if (node.sh) { newNode.sh = node.sh; }
    if (node.ac) { newNode.ac = node.ac; }
    if (node.ec) { newNode.ec = node.ec; }

    if (node.nw) {
      newNode.nw = this.clone(node.nw);
      newNode.nw.prev = newNode;
    }

    if (node.n) {
      newNode.n = this.clone(node.n);
      newNode.n.prev = newNode;
    }

    if (node.ne) {
      newNode.ne = this.clone(node.ne);
      newNode.ne.prev = newNode;
    }

    return newNode;
  }
}
