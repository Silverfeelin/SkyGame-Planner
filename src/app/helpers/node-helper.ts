import { INode } from "../interfaces/node.interface";

export class NodeHelper {
  /** Finds the first node that satisfies the predicate. */
  static find(node: INode, predicate: (node: INode) => boolean): INode | undefined {
    if (predicate(node)) { return node; }
    return node?.nw && this.find(node.nw, predicate)
      || node?.ne && this.find(node.ne, predicate)
      || node?.n && this.find(node.n, predicate)
      || undefined;
  }
}
