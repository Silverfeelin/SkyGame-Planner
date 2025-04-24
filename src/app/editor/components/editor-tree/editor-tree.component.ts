import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { nanoid } from 'nanoid';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { DataJsonService } from 'src/app/services/data-json.service';
import { DataService } from 'src/app/services/data.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ICost } from '@app/interfaces/cost.interface';
import { CostHelper } from '@app/helpers/cost-helper';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from "../../../components/spirit-tree/spirit-tree.component";

interface IEditorSearchItem {
  item: IItem;
  name: string;
}

interface IEditorNode extends ICost {
  guid: string;
  nw?: IEditorNode;
  n?: IEditorNode;
  ne?: IEditorNode;
  prev?: IEditorNode;

  x: number;
  y: number;

  item?: IItem;
  itemGuid?: string;
}

@Component({
    selector: 'app-editor-tree-spirit',
    templateUrl: './editor-tree.component.html',
    styleUrls: ['./editor-tree.component.less'],
    imports: [NgTemplateOutlet, MatIcon, FormsModule, ItemIconComponent, SpiritTreeComponent]
})
export class EditorTreeComponent implements OnInit {
  @ViewChild('inpCloneTree', { static: true }) inpCloneTree!: ElementRef<HTMLInputElement>;

  itemOptions = new Array<IEditorSearchItem>();

  editorNode: IEditorNode;
  treeHeight = 1;
  highlightItem?: string;
  clonedNodeInputValues: { [guid: string]: string } = {};

  generatedTree?: ISpiritTree;

  constructor(
    private readonly _dataService: DataService,
    private readonly _dataJsonService: DataJsonService,
    private readonly _route: ActivatedRoute
  ) {

    this.editorNode = { guid: nanoid(10), x: 1, y: 0 };

    this.calculateTreeHeight();

    // Fuzzy search items
    this.itemOptions = [];
    this.itemOptions.push(...this._dataService.itemConfig.items.map(item => ({
      item,
      name: item.level && item.level > 1 ? `${item.name} (${item.level})` : item.name
    })));
  }

  ngOnInit(): void {

  }

  addRootNode(): void {
    const adjustY = (node: IEditorNode) => {
      if (node.nw) { adjustY(node.nw); }
      if (node.n) { adjustY(node.n); }
      if (node.ne) { adjustY(node.ne); }
      node.y++;
    }

    const editorNode = this.editorNode;
    this.editorNode = { guid: nanoid(10), x: 1, y: 0 };
    this.editorNode.n = editorNode;
    adjustY(editorNode);
    this.calculateTreeHeight();
  }

  cloneTree(): void {
    const guid = this.inpCloneTree.nativeElement.value || '';
    const tree = this._dataService.guidMap.get(guid) as ISpiritTree;
    if (!tree || !tree.node) { return alert('Tree not found.'); }

    this.clonedNodeInputValues = {};
    this.editorNode = { guid: nanoid(10), x: 1, y: 0 };
    const setEditorNode = (node: IEditorNode, treeNode: INode, prevNode: IEditorNode | undefined) => {
      if (prevNode) { node.prev = prevNode; }
      CostHelper.add(node, treeNode);
      node.itemGuid = treeNode.item?.guid;
      node.item = treeNode.item;
      if (treeNode.nw) { node.nw = { guid: nanoid(10), x: node.x - 1, y: node.y + 1 }; setEditorNode(node.nw, treeNode.nw!, node); }
      if (treeNode.n) { node.n = { guid: nanoid(10), x: node.x, y: node.y + 1 }; setEditorNode(node.n, treeNode.n!, node); }
      if (treeNode.ne) { node.ne = { guid: nanoid(10), x: node.x + 1, y: node.y + 1 }; setEditorNode(node.ne, treeNode.ne!, node); }

      this.clonedNodeInputValues[node.guid] = node.c ? `${node.c}c` : node.h ? `${node.h}h` : node.sc ? `${node.sc}sc`
        : node.sh ? `${node.sh}sh` : node.ac ? `${node.ac}ac` : node.ec ? `${node.ec}ec` : '';
    };
    setEditorNode(this.editorNode, tree.node, undefined);
    this.calculateTreeHeight();
    this.generate();
  }

  onTreeNodeClicked(event: SpiritTreeNodeClickEvent) {
    if (!event.node.item) { return; }
    if (!this.highlightItem) {
      this.highlightItem = event.node.item.guid;
      return;
    }

    if (this.highlightItem !== event.node.item.guid) {
      this.swapItems(event.node.item.guid, this.highlightItem);
    }
    this.highlightItem = undefined;
  }

  swapItems(itemA: string, itemB: string) {
    const findItemNode = (itemGuid: string, node: IEditorNode): IEditorNode | undefined => {
      if (node.itemGuid === itemGuid) { return node; }
      if (node.nw) { const n = findItemNode(itemGuid, node.nw); if (n) { return n; } }
      if (node.n) { const n = findItemNode(itemGuid, node.n); if (n) { return n; } }
      if (node.ne) { const n = findItemNode(itemGuid, node.ne); if (n) { return n; } }
      return undefined;
    }
    const nodeA = findItemNode(itemA, this.editorNode);
    const nodeB = findItemNode(itemB, this.editorNode);
    if (!nodeA || !nodeB) { return; }

    const costA = CostHelper.add(CostHelper.create(), nodeA);
    const costB = CostHelper.add(CostHelper.create(), nodeB);

    CostHelper.clear(nodeA);
    CostHelper.add(nodeA, costB);
    CostHelper.clear(nodeB);
    CostHelper.add(nodeB, costA);
    nodeA.item = this._dataService.guidMap.get(itemB) as IItem;
    nodeA.itemGuid = itemB;
    nodeB.item = this._dataService.guidMap.get(itemA) as IItem
    nodeB.itemGuid = itemA;

    this.generate();
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
        return this._dataJsonService.spiritTreesToJson([this.generatedTree!]);
      case 'nodes':
        return this._dataJsonService.nodesToJson(NodeHelper.all(this.generatedTree!.node));
    }
    return undefined;
  }

  generate(): void {
    const tree = this.generateTree();
    this.generatedTree = tree;
  }

  generateTree(): ISpiritTree {
    const tree: ISpiritTree = {
      guid: nanoid(10),
      node: this.generateNode(this.editorNode)
    };

    return tree;
  }

  generateNode(node: IEditorNode): INode {
    const treeNode: INode = {
      guid: nanoid(10),
      item: node.item
    };

    CostHelper.add(treeNode, node);

    if (node.nw) { treeNode.nw = this.generateNode(node.nw); }
    if (node.n) { treeNode.n = this.generateNode(node.n); }
    if (node.ne) { treeNode.ne = this.generateNode(node.ne); }

    return treeNode;
  }

  nodeAdd(node: IEditorNode, direction: 'nw' | 'n' | 'ne'): void {
    if (node[direction]) {
      return this.nodeRemove(node[direction]!);
    }

    let [x, y] = [node.x, node.y];
    switch( direction) {
      case 'nw': x--; break;
      case 'n': y++; break;
      case 'ne': x++; break;
    }

    // Check if cell is already occupied
    const check = (node?: IEditorNode): boolean => {
      if (!node) { return false; }
      if (node.x === x && node.y === y) { return true; }
      return check(node.nw) || check(node.n) || check(node.ne);
    }

    if (check(this.editorNode)) {
      alert('That cell is already occupied!');
      return;
    }

    node[direction] = { guid: nanoid(10), x, y, prev: node };
    this.calculateTreeHeight();
    this.generate();
  }

  nodeRemove(node: IEditorNode): void {
    if (!node.prev) { return; }
    if (!confirm('Are you sure you want to remove this node? All connected nodes will also be removed!')) { return; }

    if (node.prev.nw === node) { node.prev.nw = undefined; }
    if (node.prev.n === node) { node.prev.n = undefined; }
    if (node.prev.ne === node) { node.prev.ne = undefined; }

    this.calculateTreeHeight();
    this.generate();
  }

  nodeGuidChanged(evt: Event, node: IEditorNode): void {
    const value = (evt.target as HTMLInputElement).value;
    node.itemGuid = '';
    node.item = undefined;
    if (!value) { return; }

    const id = +value;
    if (id) {
      node.item = this._dataService.itemIdMap.get(id) as IItem;
      node.itemGuid = node.item?.guid ?? '';
      return
    }

    let item = this._dataService.guidMap.get(value) as IItem;
    if (!item) {
      const results = fuzzysort.go(value, this.itemOptions, { key: 'name', limit: 1 });
      item = (results?.[0]?.obj as IEditorSearchItem)?.item;
    }

    node.item = item;
    node.itemGuid = item?.guid;
    this.generate();
  }

  nodeCostChanged(evt: Event, cost: ICost): void {
    const target = (evt.target as HTMLInputElement);
    CostHelper.clear(cost);

    let match = target.value.match(/(\d+)\s*([a-z]+)/g);
    if (!match) {
      const c = +target.value;
      cost.c = c || 0;
      this.generate();
      return;
    }

    for (const m of match) {
      const value = +m.match(/\d+/g)![0];
      const type = m.match(/[a-z]+/g)![0];

      switch (type) {
        case 'c': cost.c = value; break;
        case 'h': cost.h = value; break;
        case 'sc': cost.sc = value; break;
        case 'sh': cost.sh = value; break;
        case 'ac': cost.ac = value; break;
        case 'ec': cost.ec = value; break;
      }
    }

    this.generate();
  }

  calculateTreeHeight(): void {
    this.treeHeight = 1;

    const check = (node: IEditorNode) => {
      if (!node) { return; }
      if (node.y >= this.treeHeight!) { this.treeHeight = node.y + 1; }
      if (node.nw) { check(node.nw); }
      if (node.n) { check(node.n); }
      if (node.ne) { check(node.ne); }
    }

    check(this.editorNode);
  }
}
