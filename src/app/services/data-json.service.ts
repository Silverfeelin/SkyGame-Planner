import { Injectable } from '@angular/core';
import { IItem } from '../interfaces/item.interface';
import { INode } from '../interfaces/node.interface';
import { ISpiritTree } from '../interfaces/spirit-tree.interface';
import { ITravelingSpirit } from '../interfaces/traveling-spirit.interface';

@Injectable({
  providedIn: 'root'
})
export class DataJsonService {

  constructor() { }

  travelingSpiritsToJson(ts: Array<ITravelingSpirit>): string {
    return this.stringify(ts.map(ts => {
      const d = ts.date;
      return {
        guid: ts.guid,
        date: d.toFormat('yyyy-MM-dd'),
        spirit: ts.spirit.guid,
        tree: ts.tree.guid
      };
    }));
  }

  spiritTreesToJson(trees: Array<ISpiritTree>): string {
    return this.stringify(trees.map(tree => {
      return {
        guid: tree.guid,
        node: tree.node.guid
      };
    }));
  }

  nodesToJson(nodes: Array<INode>): string {
    return this.stringify(nodes.map(node => {
      return {
        guid: node.guid,
        item: node.item?.guid,
        c: node.c,
        h: node.h,
        sc: node.sc,
        sh: node.sh,
        ac: node.ac,
        ec: node.ec,
        nw: node.nw?.guid,
        n: node.n?.guid,
        ne: node.ne?.guid
      };
    }));
  }

  itemsToJson(items: Array<IItem>): string {
    return this.stringify(items.map(item => {
      return {
        guid: item.guid,
        type: item.type,
        name: item.name,
        icon: item.icon,
        level: item.level
      };
    }));
  }

  private stringify(array: Array<unknown>): string {
    return JSON.stringify(array, undefined, 2);
  }
}
