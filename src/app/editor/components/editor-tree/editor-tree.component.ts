import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { nanoid } from 'nanoid';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { DataJsonService } from 'src/app/services/data-json.service';
import { DataService } from 'src/app/services/data.service';

interface IFormNode {
  nw?: boolean;
  n?: boolean;
  ne?: boolean

  item?: string;
  itemRef?: IItem;

  c?: number;
  h?: number;
  sc?: number;
  sh?: number;
  ac?: number;
  ec?: number;
}

@Component({
  selector: 'app-editor-tree-spirit',
  templateUrl: './editor-tree.component.html',
  styleUrls: ['./editor-tree.component.less']
})
export class EditorTreeComponent implements OnInit {
  itemOptions = new Array<IItem>();

  formNodes: Array<IFormNode>;

  result?: ISpiritTree;

  constructor(
    private readonly _dataService: DataService,
    private readonly _dataJsonService: DataJsonService,
    private readonly _route: ActivatedRoute
  ) {
      this.formNodes = [];
      for (let i = 0; i < 24; i++) { this.formNodes.push({
        n: !((i+2) % 3)
      }); }
  }

  ngOnInit(): void {
    this.formNodes.forEach(n => n.item = undefined);

    const copyTree = this._route.snapshot.queryParams['copy'];
    if (copyTree) {
      const tree = this._dataService.guidMap.get(copyTree) as ISpiritTree;
      this.formNodes = this.nodeToFormNodes(tree.node);
    }

    this.itemOptions = [];

    // Add items
    this.itemOptions.push(...this._dataService.itemConfig.items);

    // Create new items
    this.itemOptions.push({ guid: 'DON\'T PICK', name: '-- NEW ITEMS --', type: ItemType.Special });
    this.itemOptions.push(this.createWingBuff());
    this.itemOptions.push(this.createHeart());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
    this.itemOptions.push(this.createBlessing());
  }

  toggleConnection(node: any, direction: string) {
    node[direction] = !node[direction];
  }

  itemInputChanged(event: Event, i: number): void {
    const target = (event.target as HTMLInputElement);
    const value = target?.value as string;
    if (!value) { return; }

    const jsonNode = this.getNodeFromJson(value);
    if (jsonNode) {
      this.formNodes[i] = jsonNode;
      return;
    }

    const item = this._dataService.guidMap.get(value) as IItem;
    if (!item) { return; }

    this.formNodes[i].item = item.guid;
    this.formNodes[i].itemRef = item;

    target.value = '';
    target.blur();
  }

  itemInputEnter(event: KeyboardEvent, i: number): void {
    if (event.key !== 'Enter') { return; }  // Only handle enter key

    const target = (event.target as HTMLInputElement);
    const value = target?.value as string;
    if (!value) { return; }
    const results = fuzzysort.go(value, this.itemOptions, { key: 'name', limit: 1 });
    const item = results?.[0].obj as IItem;
    if (!item) { return; }

    this.formNodes[i].item = item.guid;
    this.formNodes[i].itemRef = item;

    target.value = '';
  }

  submit(): void {
    const baseNode = this.formNodeToNodes();
    const nodes = NodeHelper.all(baseNode);

    // Create tree
    const tree: ISpiritTree = {
      guid: nanoid(10),
      node: nodes[0]
    };

    console.log('tree generated', tree);

    this.result = tree;
  }

  copyToClipboard(type: string): void {
    let value = this.getForClipboard(type);
    if (!value) { return; }
    const startI = value.indexOf('{');
    const endI = value.lastIndexOf('}');
    value = value.substring(startI, endI + 1) + ',';
    navigator.clipboard.writeText(value);
  }

  getForClipboard(type: string): string | undefined {
    switch (type) {
      case 'tree':
        return this._dataJsonService.spiritTreesToJson([this.result!]);
      case 'nodes':
        return this._dataJsonService.nodesToJson(NodeHelper.all(this.result!.node));
      case 'items': {
        const nodes = NodeHelper.all(this.result!.node);
        const newItems = nodes
          .filter(n => n.item?.guid && !this._dataService.guidMap.has(n.item.guid))
          .map(n => n.item!);
        return this._dataJsonService.itemsToJson(newItems);
      }
    }
    return undefined;
  }

  nodeToFormNodes(mainNode: INode): Array<IFormNode> {
    const formNodes = new Array<IFormNode>();

    for (let i = 0; i < 24; i++) {
      formNodes.push({});
    }

    const defineNode = (i: number, node: INode) => {
      formNodes[i] = {
        item: node.item?.guid,
        itemRef: node.item,
        c: node.c,
        h: node.h,
        ac: node.ac,
        ec: node.ec,
        sc: node.sc,
        sh: node.sh,
        n: !!node.n,
        nw: !!node.nw,
        ne: !!node.ne
      };

      if (node.nw) { defineNode(i - 1, node.nw); }
      if (node.n) { defineNode(i - 3, node.n); }
      if (node.ne) { defineNode(i + 1, node.ne); }
    };

    let i = 22;
    defineNode(i, mainNode);

    return formNodes;
  }

  copyNodeToClipboard(node: IFormNode): void {
    const n = {...node};
    delete n.itemRef;

    navigator.clipboard.writeText(JSON.stringify(n));
  }

  getNodeFromJson(json: string): IFormNode | undefined {
    try {
      const node = JSON.parse(json) as IFormNode;
      if (node.item) {
        node.itemRef = this._dataService.guidMap.get(node.item) as IItem;
      }

      return node;
    } catch { return undefined; }
  }

  formNodeToNodes(node?: INode, i = 22): INode {
    const formNode = this.formNodes[i];
    node ??= this.formNodeToNode(formNode)!;
    if (!formNode) { return node; }

    // Left (north-west)
    if (formNode.nw) {
      const j = i - 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.nw = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }

    // Top (north)
    if (formNode.n) {
      const j = i - 3;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.n = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }

    // Right (north-east)
    if (formNode.ne) {
      const j = i + 1;
      const relativeNode = this.formNodeToNode(this.formNodes[j]);
      if (relativeNode) {
        node.ne = relativeNode;
      }
      this.formNodeToNodes(relativeNode, j);
    }

    return node;
  }

  formNodeToNode(formNode: IFormNode): INode | undefined {
    if (!formNode?.item) { return undefined; }

    return {
      guid: nanoid(10),
      item: this.itemOptions.find(i => i.guid === formNode.item),
      c: formNode.c,
      h: formNode.h,
      ac: formNode.ac,
      ec: formNode.ec,
      sc: formNode.sc,
      sh: formNode.sh
    };
  }

  createHeart(): IItem {
    return {
      guid: nanoid(10),
      type: ItemType.Special,
      name: 'Heart',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Heart.png'
    }
  }

  createBlessing(): IItem {
    return {
      guid: nanoid(10),
      type: ItemType.Special,
      name: 'Blessing',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8e/5CandlesSpell.png'
    }
  }

  createWingBuff(): IItem {
    return {
      guid: nanoid(10),
      type: ItemType.WingBuff,
      name: 'Wing Buff',
      icon: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Winglight.png'
    }
  }
}
