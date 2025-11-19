import { ChangeDetectionStrategy, Component, HostListener, isDevMode } from '@angular/core';
import { IItem, IItemSource, IItemSourceIap, IItemSourceListNode, IItemSourceNode, ItemType } from '@app/interfaces/item.interface';
import { CardComponent } from "../../layout/card/card.component";
import { DataService } from '@app/services/data.service';
import { ItemIconComponent } from "../item-icon/item-icon.component";
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NodeHelper } from '@app/helpers/node-helper';
import { INode } from '@app/interfaces/node.interface';
import { ItemHelper } from '@app/helpers/item-helper';
import { IEvent, IEventInstance } from '@app/interfaces/event.interface';
import { ITravelingSpirit } from '@app/interfaces/traveling-spirit.interface';
import { ICost } from '@app/interfaces/cost.interface';
import { IReturningSpirit } from '@app/interfaces/returning-spirits.interface';
import { CostHelper } from '@app/helpers/cost-helper';
import { IItemListNode } from '@app/interfaces/item-list.interface';
import { IIAP } from '@app/interfaces/iap.interface';
import { CostComponent } from "../../util/cost/cost.component";
import { ItemTypePipe } from "../../../pipes/item-type.pipe";
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { ItemClickEvent, ItemsComponent } from "../items.component";
import { IRevisedSpiritTree, ISpiritTree, ISpiritTreeTier } from '@app/interfaces/spirit-tree.interface';
import { nanoid } from 'nanoid';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from "../../spirit-tree/spirit-tree.component";
import { ItemUnlockCalculatorSpiritsComponent } from "./item-unlock-calculator-spirits/item-unlock-calculator-spirits.component";
import { ISpirit } from '@app/interfaces/spirit.interface';
import { ItemUnlockCalculatorEventsComponent } from "./item-unlock-calculator-events/item-unlock-calculator-events.component";
import { DateHelper } from '@app/helpers/date-helper';
import { MatIcon } from '@angular/material/icon';
import { ItemUnlockCalculatorSeasonsComponent } from "./item-unlock-calculator-seasons/item-unlock-calculator-seasons.component";
import { ISeason } from '@app/interfaces/season.interface';
import { Router } from '@angular/router';
import { TreeHelper } from '@app/helpers/tree-helper';

interface IItemResult {
  item: IItem;
  description?: string;
  found: boolean;

  hasTree?: boolean;
  estimatedCost?: ICost;
  hasUnknownCost?: boolean;
  cost?: ICost;
  isEmptyCost?: boolean;
  listNode?: IItemListNode;
  nodes?: Array<INode>;

  iap?: IIAP;
  price?: number;
  eventInstance?: IEventInstance;
  ts?: ITravelingSpirit;
  rs?: IReturningSpirit;
}

@Component({
    selector: 'app-item-unlock-calculator',
    imports: [
        CardComponent, ItemIconComponent, NgbTooltip, CostComponent, ItemTypePipe, DecimalPipe,
        LowerCasePipe, ItemsComponent, SpiritTreeComponent, ItemUnlockCalculatorSpiritsComponent,
        ItemUnlockCalculatorEventsComponent, MatIcon,
        ItemUnlockCalculatorSeasonsComponent
    ],
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
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask, ItemType.FaceAccessory,
    ItemType.Necklace, ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
    ItemType.Held, ItemType.Furniture, ItemType.Prop, ItemType.Emote,
    ItemType.Stance, ItemType.Call, ItemType.Music
  ];
  itemTypeSet = new Set(this.itemTypes);

  showAddSpirits = false;
  showAddSeasons = false;
  showAddEvents = false;
  showAddItems = false;

  itemListItems: Array<IItem> = [];

  items: Array<IItem> = [];
  itemSet = new Set<IItem>();
  ownedItems: Array<IItem> = [];

  results: Array<IItemResult> = [];
  showAsTrees = false;

  totalCost: ICost = CostHelper.create();
  totalCostIncludesEstimates = false;
  totalCostIncludesOngoingEvent = false;
  totalCostIncludesOngoingSeason = false;
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
    private readonly _dataService: DataService,
    private readonly _router: Router
  ) {
    this.onItemTypeChanged(this.itemType);
    this.readItemsFromUrl();
    if (this.items.length) { this.calculate(); }
  }

  shareSelection(): void {
    if (!navigator.share) { return alert('Sharing is not supported by this browser.'); }
    if (!this.items.length) { return alert('No items selected.'); }

    const text = `Sky Planner: Cost Calculator (${this.items.length} items)`;
    const url = new URL(location.href);
    let ids = url.searchParams.get('items');
    ids = ids?.substring(0, 300) ?? '';
    url.searchParams.set('items', ids);
    const shareData: ShareData = { title: 'Sky Planner: Cost Calculator', text, url: url.toString() };
    if (!navigator.canShare(shareData)) { return alert('Sharing is not supported by this browser.'); }

    void navigator.share(shareData);
  }

  createCollection(): void {
    if (!this.items.length) { return alert('No items selected.'); }
    const queryParams = { items: ItemHelper.serializeQuery(this.items) };
    this._router.navigate(['/item/collection'], { queryParams });
  }

  showCostBreakdown(result: IItemResult): void {
    if (!result.nodes?.length) { return; }
    const nodes = result.nodes;
    const nodeString = nodes.filter(n => n.item).map(node => {
      const cost = CostHelper.add(CostHelper.create(), node);
      if (CostHelper.isEmpty(cost)) { return `${node.item!.name}: free`; }
      const costString = Object.entries(cost).filter(([,v]) => v > 0).map(([k,v]) => `${v}${k}`).join(', ');
      return `${node.item!.name}: ${costString}`;
    }).join('\n');
    alert(nodeString);
  }

  showNoCostInfo(result: IItemResult): void {
    alert(`This item is either free or the item is required by another item. Please view the spirit trees for more details.`);
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

  onItemsChanged(items: Array<IItem>): void {
    this.itemListItems = items;
  }

  addItemsFromList(): void {
    if (this.itemListItems.length > 25) {
      if (!confirm(`Are you sure you want to add ${this.itemListItems.length} items? Too many items may slow down the calculator.`)) { return; }
    }

    const messages = this.tryAddItems(this.itemListItems);
    if (messages.length) {
      alert(messages.join('\n'));
    }

    this.calculate();
  }

  onSpiritSelected(spirit: ISpirit) {
    const tree = spirit.treeRevisions?.findLast<IRevisedSpiritTree>(t => t.revisionType === 'AfterSeason' || t.revisionType === 'DuringSeason') ?? spirit.tree;
    if (!tree) {
      alert('This spirit does not have a spirit tree.');
      return;
    }

    const items = TreeHelper.getItems(tree);
    this.addFilteredKeyItems(items);
  }

  onSeasonSelected(season: ISeason): void {
    const spirits = season.spirits.filter(s => s.type === 'Season');
    const trees = spirits.filter(s => s.tree).map(s => s.tree!);
    if (!trees.length) {
      alert('This season does not have any spirits with spirit trees.');
      return;
    }

    const items = trees.flatMap(t => TreeHelper.getItems(t));
    this.addFilteredKeyItems(items);
  }

  onSeasonGuideSelected(season: ISeason): void {
    const spirit = season.spirits.find(s => s.type === 'Guide');
    const items = spirit?.tree ? TreeHelper.getItems(spirit.tree) : [];
    if (!items.length) {
      alert('This season guide does not items that can be added.');
      return;
    }

    this.addFilteredKeyItems(items);
  }

  onEventSelected(event: IEvent) {
    const instance = event.instances?.at(-1);
    if (!instance) { return; }

    const items: Array<IItem> = [];
    for (const spirit of instance.spirits || []) {
      items.push(...TreeHelper.getItems(spirit.tree));
    }

    for (const shop of instance.shops || []) {
      if (shop.itemList) {
        const v = shop.itemList.items.map(i => i.item);
        items.push(...v);
      } else if (shop.iaps) {
        const v = shop.iaps.filter(a => a.items).flatMap(i => i.items!);
        items.push(...v);
      }
    }

    this.addFilteredKeyItems(items);
  }

  private addFilteredKeyItems(items: Array<IItem>): void {
    const filteredItems = this.filterKeyItems(items);
    if (!filteredItems.length) {
      alert('There are no items to add.');
      return;
    }
    const messages = this.tryAddItems(filteredItems);
    if (messages.length) {
      alert(messages.join('\n'));
    }

    this.calculate();
  }

  private filterKeyItems(items: Array<IItem>): Array<IItem> {
    const filtered = items.filter(i => this.itemTypeSet.has(i.type) && i.group !== 'Limited' && i.group !== 'Ultimate');
    return filtered;
  }

  tryAddItems(items: Array<IItem>): Array<string> {
    const messages: Array<string> = [];
    for (const item of items) {
      const msg = this.tryAddItem(item);
      msg && messages.push(`${item.name}: ${msg}`);
    }
    return messages;
  }

  tryAddItem(item: IItem): string | undefined {
    // Don't allow duplicate items.
    if (this.itemSet.has(item)) {
      return `This item is already in the calculator.`;
    }

    // Don't allow limited items.
    if (item.group === 'Ultimate' || item.group === 'Limited') {
      const src = ItemHelper.getItemSource(item, true);
      let srcSeason: ISeason | undefined;
      let srcEvent: IEventInstance | undefined;
      switch (src?.type) {
        case 'iap': {
          srcSeason = src.source.shop?.season;
          srcEvent = src.source.shop?.event;
          break;
        }
        case 'list': {
          srcSeason = src.source.itemList.shop?.season;
          srcEvent = src.source.itemList.shop?.event;
          break;
        }
        case 'node': {
          const tree = src.source.root?.spiritTree;
          srcSeason = tree?.spirit?.season;
          srcEvent = tree?.eventInstanceSpirit?.eventInstance;
          break;
        }
      }

      if (!DateHelper.isActivePeriod(srcSeason) && !DateHelper.isActivePeriod(srcEvent)) {
        return `This is a limited item. You can't select it in this calculator.`;
      }
    }

    this.itemSet.add(item);
    this.items.push(item);
    return undefined;
  }

  viewItem(item: IItem): void {
    const url = `${location.origin}/item/${item.guid}`;
    window.open(url, '_blank');
  }

  askRemoveItems(): void {
    if (!confirm(`Remove all items from the calculator?`)) { return; }
    this.items = [];
    this.itemSet.clear();
    this.calculate();
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
    this.totalCostIncludesOngoingEvent = false;
    this.totalCostIncludesOngoingSeason = false;
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

      this.results.push(result);
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
      if (tree.node) {
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
        node && addNode(newTree.node!, node);

        this.treeOpaqueNodes[newTree.guid] = treeOpaqueNodes;
        this.treeHighlightItems[newTree.guid] = treeHighlightItems;
        this.trees.push(newTree);
      } else if (tree.tier) {
        treeOpaqueNodes = [];
        treeHighlightItems = [];
        const newTree = {
          guid: nanoid(10), name: tree.name
        } as ISpiritTree;
        const tiers = TreeHelper.getTiers(tree);
        let prevTier: ISpiritTreeTier | undefined = undefined;
        for (const tier of tiers) {
          const newTier = { guid: nanoid(10), rows: [] } as ISpiritTreeTier;
          for (const row of tier.rows) {
            const newRow = [] as Array<INode | undefined>;
            newTier.rows.push(newRow as [INode | undefined, INode | undefined, INode | undefined]);
            for (const node of row) {
              if (node == undefined) {
                newRow.push(undefined);
              } else {
                const newNode = { guid: nanoid(10), item: node.item } as INode;
                newRow.push(newNode);
                if (this.checkedNodes[node.guid] && !node.item?.unlocked) {
                  copyNodeCost(newNode, node);
                  treeOpaqueNodes.push(newNode.guid);
                }

                if (node.item && this.itemSet.has(node.item)) {
                  treeHighlightItems.push(node.item.guid);
                }

              }
            }
          }
          if (prevTier) {
            prevTier.next = newTier;
            newTier.prev = prevTier;
            newTier.root = prevTier.root;
          } else {
            newTier.root = newTier;
          }
          prevTier = newTier;
        }
        newTree.tier = prevTier?.root;
        this.treeHighlightItems[newTree.guid] = treeHighlightItems;
        this.treeOpaqueNodes[newTree.guid] = treeOpaqueNodes;
        this.trees.push(newTree);
      }
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

    // Event tree.
    const eventInstance = node.root?.spiritTree?.eventInstanceSpirit?.eventInstance;
    const isOngoingEvent = eventInstance && DateHelper.isActivePeriod(eventInstance);
    if (eventInstance && !isOngoingEvent && node.ec) {
      const result: IItemResult = { item: src.item, found: true, estimatedCost: this.findAverageByItem(src.item) };
      result.hasUnknownCost = !result.estimatedCost && !result.cost;
      return result;
    } else if (eventInstance && isOngoingEvent) {
      this.totalCostIncludesOngoingEvent = true;
    }

    const season = tree.spirit?.type === 'Season' ? tree.spirit.season : undefined;
    const isOngoingSeason = season && DateHelper.isActivePeriod(tree.spirit!.season);
    if (season && !isOngoingSeason) {
      const result: IItemResult = { item: src.item, found: true, estimatedCost: this.findAverageByItem(src.item) };
      result.hasUnknownCost = !result.estimatedCost;
      return result;
    } else if (season && isOngoingSeason) {
      this.totalCostIncludesOngoingSeason = true;
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
        CostHelper.add(totalCost, n);
      }
    }

    return {
      item: src.item,
      hasTree: true,
      found: true,
      cost: totalCost,
      isEmptyCost: CostHelper.isEmpty(totalCost),
      nodes: newNodes
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
      if (i.type !== itemType) { return false; }
      const node = i.nodes?.at(0);
      const tree = node?.root?.spiritTree;
      return tree?.spirit?.type !== 'Regular'
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
    const sIds = url.searchParams.get('items');
    if (!sIds) { return; }

    const messages: Array<string> = [];
    this.items = [];
    this.itemSet.clear();

    const ids = ItemHelper.deserializeQuery(sIds);
    for (const id of ids) {
      const item = this._dataService.itemIdMap.get(id);
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
    const ids = ItemHelper.serializeQuery(this.items);
    url.searchParams.set('items', ids);
    history.replaceState(window.history.state, '', url.toString());
  }
}
