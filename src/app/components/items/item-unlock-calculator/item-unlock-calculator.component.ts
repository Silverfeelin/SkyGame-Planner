import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { SearchComponent } from "../../search/search.component";
import { ISearchItem } from '@app/services/search.service';
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
import { DecimalPipe } from '@angular/common';

interface IItemResult {
  item: IItem;
  description?: string;
  found: boolean;

  estimatedCost?: ICost;
  cost?: ICost;
  nodes?: Array<INode>;
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
  imports: [SearchComponent, CardComponent, ItemIconComponent, NgbTooltip, CostComponent, ItemTypePipe, DecimalPipe],
  templateUrl: './item-unlock-calculator.component.html',
  styleUrl: './item-unlock-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemUnlockCalculatorComponent {
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // If results are calculated, warn on page leave.
    if (!this.results.length) { return; }
    event.preventDefault();
  }

  items: Array<IItem> = [];
  itemSet = new Set<IItem>();
  results: Array<IItemResult> = [];

  totalCost: ICost = CostHelper.create();
  totalCostIncludesEstimates = false;
  totalPrice: number = 0;
  checkedNodes: Set<INode> = new Set();
  checkedIaps: Set<IIAP> = new Set();
  itemTypeAverages: { [key: string]: number } = {};

  constructor(
    private readonly _dataService: DataService
  ) {

  }

  onRowClicked(evt: { event: MouseEvent; row: ISearchItem<unknown>; }): void {
    const row = evt.row as ISearchItem<IItem>;
    const item = row.data;

    // Remove item if it is already selected
    if (this.itemSet.has(item)) {
      return this.removeItem(item);
    }

    const err = this.tryAddItem(item);
    if (err) { alert(err); }
    else { this.calculate(); }
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

  removeItem(item: IItem): void {
    this.itemSet.delete(item);
    this.items = this.items.filter(i => i !== item);
    this.calculate();
  }

  calculate(): void {
    this.totalCost = CostHelper.create();
    this.totalCostIncludesEstimates = false;
    this.totalPrice = 0;
    this.results = [];
    this.checkedNodes = new Set();
    this.checkedIaps = new Set();

    for (const item of this.items) {
      if (item.unlocked) {
        this.results.push({ item, found: true });
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
      return { item: src.item, found: true, estimatedCost: { c: this.findAverageByItemType(src.item.type) } };
    }

    // Get the cost of the node and required predecessors.
    const nodes = NodeHelper.trace(src.source);
    const newNodes: Array<INode> = [];

    const totalCost = CostHelper.create();
    for (const n of nodes) {
      if (this.checkedNodes.has(n)) { continue; }
      this.checkedNodes.add(n);


      if (!n.unlocked && !n.item?.unlocked) {
        newNodes.push(n);
        CostHelper.add(totalCost, n.ec ? { c: 0 } : n);
      }
    }

    return {
      item: src.item,
      found: true,
      nodes: newNodes,
      cost: totalCost
    };
  }

  private handleListNode(src: IItemSourceListNode): IItemResult {
    const node = src.source;
    const cost = node.ec ? { c: this.findAverageByItemType(src.item.type) } : node;
    return { item: src.item, found: true, listNode: node, cost };
  }

  private handleIap(src: IItemSourceIap): IItemResult {
    const iap = src.source;
    if (this.checkedIaps.has(iap)) {
      return { item: src.item, found: true, price: 0 };
    }
    this.checkedIaps.add(iap);
    return { item: src.item, found: true, iap, price: iap.price ?? 0 };
  }

  private findAverageByItemType(itemType: ItemType): number {
    if (this.itemTypeAverages[itemType]) {
      return this.itemTypeAverages[itemType];
    }

    if (itemType === ItemType.Emote) { return 0; }
    if (itemType === ItemType.Spell) { return 5; }

    const items = this._dataService.itemConfig.items.filter(i => {
      return i.type === itemType && i.nodes?.at(0)?.root?.spiritTree?.spirit?.type !== 'Regular'
    });
    let count = 0;
    const total = items.reduce((acc, item) => {
      const lastNode: ICost | undefined = item?.nodes?.at(-1) ?? item?.listNodes?.at(-1);
      if (!lastNode?.c) { return acc; }
      count++;
      return acc + lastNode.c;
    }, 0);

    if (count === 0) { return 0; }
    const avg = total / count;
    const roundedAvg = Math.ceil(avg / 5) * 5;
    this.itemTypeAverages[itemType] = roundedAvg;
    return roundedAvg;
  }
}
