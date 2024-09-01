import { ChangeDetectionStrategy, Component, HostListener, isDevMode } from '@angular/core';
import { SearchComponent } from "../../search/search.component";
import { IItem, IItemSource, IItemSourceIap, IItemSourceListNode, IItemSourceNode, ItemType } from '@app/interfaces/item.interface';
import { CardComponent } from "../../layout/card/card.component";
import { DataService } from '@app/services/data.service';
import { ItemIconComponent } from "../item-icon/item-icon.component";
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NodeHelper } from '@app/helpers/node-helper';
import { INode } from '@app/interfaces/node.interface';
import { ItemHelper } from '@app/helpers/item-helper';
import { IEventInstance } from '@app/interfaces/event.interface';
import { ITravelingSpirit } from '@app/interfaces/traveling-spirit.interface';
import { ICost } from '@app/interfaces/cost.interface';
import { IReturningSpirit } from '@app/interfaces/returning-spirits.interface';
import { CostHelper } from '@app/helpers/cost-helper';
import { IItemListNode } from '@app/interfaces/item-list.interface';
import { IIAP } from '@app/interfaces/iap.interface';
import { CostComponent } from "../../util/cost/cost.component";
import { ItemTypePipe } from "../../../pipes/item-type.pipe";
import { DecimalPipe } from '@angular/common';
import { ItemClickEvent, ItemsComponent } from "../items.component";
import { ItemTypeSelectorComponent } from "../item-type-selector/item-type-selector.component";
import { IRevisedSpiritTree, ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { nanoid } from 'nanoid';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from "../../spirit-tree/spirit-tree.component";
import { ItemUnlockCalculatorSpiritsComponent } from "./item-unlock-calculator-spirits/item-unlock-calculator-spirits.component";
import { ISpirit } from '@app/interfaces/spirit.interface';

interface IItemResult {
  item: IItem;
  description?: string;
  found: boolean;

  hasTree?: boolean;
  estimatedCost?: ICost;
  hasUnknownCost?: boolean;
  cost?: ICost;
  listNode?: IItemListNode;

  iap?: IIAP;
  price?: number;
  eventInstance?: IEventInstance;
  ts?: ITravelingSpirit;
  rs?: IReturningSpirit;
}

@Component({
  selector: 'app-item-unlock-calculator',
  standalone: true,
  imports: [SearchComponent, CardComponent, ItemIconComponent, NgbTooltip, CostComponent, ItemTypePipe, DecimalPipe, ItemsComponent, ItemTypeSelectorComponent, SpiritTreeComponent, ItemUnlockCalculatorSpiritsComponent],
  templateUrl: './item-unlock-calculator.component.html',
  styleUrl: './item-unlock-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorComponent {
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (isDevMode()) { return; }
    // If results are calculated, warn on page leave.
    if (!this.results.length) { return; }
    event.preventDefault();
  }

  itemType: ItemType = ItemType.Outfit;
  itemTypes: Array<string> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.Mask, ItemType.FaceAccessory,
    ItemType.Necklace, ItemType.Hair, ItemType.Hat, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop, ItemType.Emote,
    ItemType.Stance, ItemType.Call, ItemType.Music
  ];
  itemTypeSet = new Set(this.itemTypes);

  showAddSpirits = false;
  showAddItems = false;

  items: Array<IItem> = [];
  itemSet = new Set<IItem>();
  ownedItems: Array<IItem> = [];

  results: Array<IItemResult> = [];

  totalCost: ICost = CostHelper.create();
  totalCostIncludesEstimates = false;
  totalPrice: number = 0;
  checkedTrees: { [key: string]: ISpiritTree } = {};
  checkedNodes: { [key: string]: INode } = {};
  checkedIaps: { [key: string]: IIAP } = {};
  itemTypeAverages: { [key: string]: ICost } = {};

  treeRoots: { [key: string]: ISpiritTree } = {};
  treeOpaqueNodes: { [key: string]: Array<string> } = {};
  treeHighlightItems: { [key: string]: Array<string> } = {};
  trees: Array<ISpiritTree> = [];

  constructor(
    private readonly _dataService: DataService
  ) {
    this.onItemTypeChanged(this.itemType);
    this.readItemsFromUrl();
    if (this.items.length) { this.calculate(); }
  }

  onNodeClicked(evt: SpiritTreeNodeClickEvent) {
    if (!evt.node.item) { return; }
    if (!this.itemSet.has(evt.node.item)) {
      if (!confirm(`Add '${evt.node.item.name}' to the calculator?`)) { return; }
      const msg = this.tryAddItem(evt.node.item);
      if (msg) { alert(msg); }
      else { this.calculate(); }
    } else {
      if (!confirm(`Remove '${evt.node.item.name}' from the calculator?`)) { return; }
      this.removeItem(evt.node.item);
    }
  }

  onItemTypeChanged(type: ItemType) {
    this.itemType = type;
  }

  onItemClicked(evt: ItemClickEvent) {
    const item = evt.item;

    // Remove item if it is already selected
    if (this.itemSet.has(item)) {
      if (!confirm(`You already added this item. Remove '${item.name}' from the calculator?`)) { return; }
      return this.removeItem(item);
    }

    const err = this.tryAddItem(item);
    if (err) { alert(err); }
    else { this.calculate(); }
  }

  onSpiritSelected(spirit: ISpirit) {
    const tree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'AfterSeason' || t.revisionType === 'DuringSeason') ?? spirit.tree;
    if (!tree) {
      alert('This spirit does not have a spirit tree.');
      return;
    }

    const items = NodeHelper.getItems(tree.node);
    if (items.some(i => this.itemSet.has(i))) {
      alert('This spirit tree contains items that are already in the calculator.');
      return;
    }

    const messages: Array<string> = [];
    let keyItems = items.filter(i => this.itemTypeSet.has(i.type));
    if (!keyItems.length) { keyItems = items; }
    keyItems.forEach(i => {
      const msg = this.tryAddItem(i);
      msg && messages.push(`${i.name}: ${msg}`);
    });

    if (messages.length) {
      alert(messages.join('\n'));
    }

    this.calculate();
  }

  tryAddItem(item: IItem): string | undefined {
    // Don't allow limited items.
    if (item.group === 'Ultimate' || item.group === 'Limited') {
      return `This is a limited item. You can't select it in this calculator.`;
    }

    this.itemSet.add(item);
    this.items.push(item);
    return undefined;
  }

  askRemoveItems(): void {
    if (!confirm(`Remove all items from the calculator?`)) { return; }
    this.items = [];
    this.itemSet.clear();
    this.calculate();
  }

  askRemoveItem(item: IItem): void {
    if (!confirm(`Remove '${item.name}' from the calculator?`)) { return; }
    this.removeItem(item);
  }

  removeItem(item: IItem): void {
    this.itemSet.delete(item);
    this.items = this.items.filter(i => i !== item);
    this.calculate();
  }

  calculate(): void {
    this.updateUrl();

    this.totalCost = CostHelper.create();
    this.totalCostIncludesEstimates = false;
    this.totalPrice = 0;
    this.ownedItems = [];
    this.results = [];
    this.checkedTrees = {};
    this.checkedNodes = {};
    this.checkedIaps = {};
    this.trees = [];
    this.treeRoots = {};

    for (const item of this.items) {
      if (item.unlocked) {
        this.ownedItems.push(item);
        continue;
      }

      const src = ItemHelper.getItemSource(item, true);
      if (!src) {
        this.results.push({ item, found: false });
        continue;
      }

      const result = this.handleSource(src);
      if (result.estimatedCost) {
        this.totalCostIncludesEstimates = true;
        CostHelper.add(this.totalCost, result.estimatedCost);
      } else if (result.cost) {
        CostHelper.add(this.totalCost, result.cost);
      } else if (result.price) {
        this.totalPrice += result.price;
      }

      if (!result.hasTree) {
        this.results.push(result);
      }
    }

    if (CostHelper.isEmpty(this.totalCost)) {
      this.totalCost.c = 0;
    }

    let treeOpaqueNodes: Array<string> = [];
    let treeHighlightItems: Array<string> = [];
    this.treeOpaqueNodes = {};
    this.treeHighlightItems = {};
    const copyNodeCost = (newNode: INode, oldNode: INode) => {
      newNode.c = oldNode.c; newNode.h = oldNode.h;
      newNode.sc = oldNode.sc; newNode.sh = oldNode.sh;
      newNode.ec = oldNode.ec; newNode.ac = oldNode.ac;
    }

    const addNode = (newNode: INode, oldNode: INode) => {
      newNode.item = oldNode.item;
      const shouldCopyCost = this.checkedNodes[oldNode.guid] && !oldNode.item?.unlocked;
      shouldCopyCost ? copyNodeCost(newNode, oldNode) : newNode.c = 0;

      if (shouldCopyCost) {
        treeOpaqueNodes.push(newNode.guid);
      }

      if (oldNode.item && this.itemSet.has(oldNode.item)) {
        treeHighlightItems.push(oldNode.item.guid);
      }

      if (oldNode.n) {
        newNode.n = { guid: nanoid(10) } as INode;
        addNode(newNode.n, oldNode.n);
      }
      if (oldNode.nw) {
        newNode.nw = { guid: nanoid(10) } as INode;
        addNode(newNode.nw, oldNode.nw);
      }
      if (oldNode.ne) {
        newNode.ne = { guid: nanoid(10) } as INode;
        addNode(newNode.ne, oldNode.ne);
      }
    };

    for (const tree of Object.values(this.checkedTrees)) {
      treeOpaqueNodes = [];
      treeHighlightItems = [];
      const name = tree.eventInstanceSpirit?.eventInstance?.name
        ?? tree.eventInstanceSpirit?.eventInstance?.event?.name
        ?? tree.ts?.spirit?.name
        ?? tree.visit?.spirit?.name
        ?? tree?.spirit?.name;
      const newTree = {
        guid: nanoid(10), name, node: { guid: nanoid(10) }
      } as ISpiritTree;
      const node = tree.node;
      addNode(newTree.node, node);

      this.treeOpaqueNodes[newTree.guid] = treeOpaqueNodes;
      this.treeHighlightItems[newTree.guid] = treeHighlightItems;
      this.trees.push(newTree);
    }
  }

  private handleSource(src: IItemSource): IItemResult {
    switch (src.type) {
      case 'node': return this.handleNode(src);
      case 'list': return this.handleListNode(src);
      case 'iap': return this.handleIap(src);
    }
  }

  private handleNode(src: IItemSourceNode): IItemResult {
    const node = src.source;
    const tree = node.root?.spiritTree;
    if (!tree) { return { item: src.item, found: false }; }

    // Event ticket or season tree. Only display average cost of this item type.
    if (node.ec || (tree.spirit?.type === 'Season' && tree === tree.spirit.tree)) {
      const result: IItemResult = { item: src.item, found: true, estimatedCost: this.findAverageByItem(src.item) };
      result.hasUnknownCost = !result.estimatedCost;
      return result;
    }

    // Save tree to rebuild display after all items are parsed.
    if (!this.checkedTrees[tree.guid]) {
      this.checkedTrees[tree.guid] = tree;
    }

    // Get the cost of the node and required predecessors.
    const nodes = NodeHelper.trace(src.source);
    const newNodes: Array<INode> = [];

    const totalCost = CostHelper.create();
    for (const n of nodes) {
      if (this.checkedNodes[n.guid]) { continue; }
      this.checkedNodes[n.guid] = n;

      if (!n.unlocked && !n.item?.unlocked) {
        newNodes.push(n);
        CostHelper.add(totalCost, n.ec ? { c: 0 } : n);
      }
    }

    return {
      item: src.item,
      hasTree: true,
      found: true,
      cost: totalCost
    };
  }

  private handleListNode(src: IItemSourceListNode): IItemResult {
    const node = src.source;
    const cost = node.ec ? this.findAverageByItem(src.item) : node;
    return { item: src.item, found: true, listNode: node, cost, hasUnknownCost: !!node.ec && !cost };
  }

  private handleIap(src: IItemSourceIap): IItemResult {
    const iap = src.source;
    if (this.checkedIaps[iap.guid]) {
      return { item: src.item, found: true, price: 0 };
    }
    this.checkedIaps[iap.guid] = iap;
    return { item: src.item, found: true, iap, price: iap.price ?? 0 };
  }

  private findAverageByItem(item: IItem): ICost | undefined {
    const itemType = item.type;
    if (this.itemTypeAverages[itemType]) {
      return this.itemTypeAverages[itemType];
    }

    if (itemType === ItemType.Emote) {
      switch (item.level) {
        case 1: return { c: 0 };
        case 2: return { h: 4 };
        case 3: return { h: 3 };
        case 4: return { h: 6 };
      }
    }
    if (itemType === ItemType.Spell) { return { c: 5 }; }

    const items = this._dataService.itemConfig.items.filter(i => {
      return i.type === itemType && i.nodes?.at(0)?.root?.spiritTree?.spirit?.type !== 'Regular'
    });
    let countCandles = 0;
    const totalCandles = items.reduce((acc, item) => {
      const lastNode: ICost | undefined = item?.nodes?.at(-1) ?? item?.listNodes?.at(-1);
      if (!lastNode?.c) { return acc; }
      countCandles++;
      return acc + lastNode.c;
    }, 0);
    let countHearts = 0;
    const totalHearts = items.reduce((acc, item) => {
      const lastNode: ICost | undefined = item?.nodes?.at(-1) ?? item?.listNodes?.at(-1);
      if (!lastNode?.h) { return acc; }
      countCandles++;
      return acc + lastNode.h;
    }, 0);

    if (countCandles) {
      const avg = totalCandles / countCandles;
      const roundedAvg = Math.ceil(avg / 5) * 5;
      this.itemTypeAverages[itemType] = { c: roundedAvg };
    } else if (countHearts) {
      const avg = totalHearts / countHearts;
      const roundedAvg = Math.ceil(avg / 5) * 5;
      this.itemTypeAverages[itemType] = { h: roundedAvg };
    }

    return countCandles || countHearts ? this.itemTypeAverages[itemType] : undefined;
  }

  private readItemsFromUrl(): void {
    const url = new URL(location.href);
    const ids = url.searchParams.get('items');
    if (!ids) { return; }

    const messages: Array<string> = [];
    this.items = [];
    this.itemSet.clear();

    for (let i = 0; i < ids.length; i += 3) {
      const segment = ids.substring(i, i + 3);
      const number = parseInt(segment, 36);
      const item = this._dataService.itemIdMap.get(number);
      if (item) {
        const msg = this.tryAddItem(item);
        msg && messages.push(`${item.name}: ${msg}`);
      }
    }

    if (messages.length) {
      setTimeout(() => { alert(messages.join('\n')); });
    }
  }

  private updateUrl(): void {
    const url = new URL(location.href);
    let ids = this.items.map(i => (i.id || 0).toString(36).padStart(3, '0')).join('');
    ids = ids.substring(0, 1800);

    url.searchParams.set('items', ids);
    history.replaceState(window.history.state, '', url.toString());
  }
}
