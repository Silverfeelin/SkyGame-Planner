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
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ICost } from '@app/interfaces/cost.interface';
import { CostHelper } from '@app/helpers/cost-helper';

interface IEditorSearchItem {
  item: IItem;
  name: string;
}

interface IEditorNode extends ICost {
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
    standalone: true,
    imports: [NgFor, NgIf, NgTemplateOutlet, MatIcon, FormsModule, ItemIconComponent]
})
export class EditorTreeComponent implements OnInit {
  itemOptions = new Array<IEditorSearchItem>();

  editorNode: IEditorNode;
  treeHeight = 1;

  generatedTree?: ISpiritTree;

  constructor(
    private readonly _dataService: DataService,
    private readonly _dataJsonService: DataJsonService,
    private readonly _route: ActivatedRoute
  ) {

    this.editorNode = { x: 1, y: 0 };

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

  submit(): void {
    const tree = this.generateTree();
    this.generatedTree = tree;
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
    if (node[direction]) { return; }
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

    node[direction] = { x, y, prev: node };
    this.calculateTreeHeight();
  }

  nodeRemove(node: IEditorNode): void {
    if (!node.prev) { return; }
    if (!confirm('Are you sure you want to remove this node? All connected nodes will also be removed!')) { return; }

    if (node.prev.nw === node) { node.prev.nw = undefined; }
    if (node.prev.n === node) { node.prev.n = undefined; }
    if (node.prev.ne === node) { node.prev.ne = undefined; }

    this.calculateTreeHeight();
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
  }

  nodeCostChanged(evt: Event, cost: ICost): void {
    const target = (evt.target as HTMLInputElement);
    CostHelper.clear(cost);

    let match = target.value.match(/(\d+)\s*([a-z]+)/g);
    if (!match) {
      const c = +target.value;
      cost.c = c || 0;
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
