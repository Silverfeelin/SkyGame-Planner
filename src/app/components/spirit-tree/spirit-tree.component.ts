import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { filter, SubscriptionLike } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-spirit-tree',
  templateUrl: './spirit-tree.component.html',
  styleUrls: ['./spirit-tree.component.less']
})
export class SpiritTreeComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() tree!: ISpiritTree;
  @Input() name?: string;
  @Input() highlight?: boolean;

  nodes: Array<INode> = [];
  left: Array<INode> = [];
  center: Array<INode> = [];
  right: Array<INode> = [];

  itemMap = new Map<string, INode>();
  hasCost!: boolean;
  totalCost!: ICost;
  remainingCost!: ICost;

  tsDate?: Date;
  rsDate?: Date;

  _itemSub?: SubscriptionLike;

  constructor(
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _elementRef: ElementRef
  ) {
  }

  ngAfterViewInit(): void {
    const element = this._elementRef.nativeElement as HTMLElement;
    const scrollElem = element.querySelector('.spirit-tree-scroll');
    if (scrollElem) { scrollElem.scrollTop = 1000; }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tree']) {
      this.initializeNodes();
      this.subscribeItemChanged();
      this.calculateRemainingCosts();

      this.tsDate = this.tree.ts?.date instanceof Date ? this.tree.ts.date : undefined;
      this.rsDate = this.tree.visit?.return?.date instanceof Date ? this.tree.visit.return.date : undefined;
    }
  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
  }

  /** Build grid from nodes. */
  initializeNodes(): void {
    // Reset data
    this.itemMap.clear();
    this.totalCost = { c: 0, h: 0, sc: 0, sh: 0, ac: 0 };
    this.remainingCost = { c: 0, h: 0, sc: 0, sh: 0, ac: 0 };
    this.nodes = []; this.left = []; this.center = []; this.right = [];
    this.hasCost = false;

    if (!this.tree) { return; }
    this.initializeNode(this.tree.node, 0, 0);
    this.hasCost = !CostHelper.isEmpty(this.totalCost);
  }

  subscribeItemChanged(): void {
    this._itemSub?.unsubscribe();
    this._itemSub = this._eventService.itemToggled
      .pipe(filter(v => this.itemMap.has(v.guid)))
      .subscribe(v => this.onItemChanged(v));
  }

  onItemChanged(item: IItem): void {
    const node = this.itemMap.get(item.guid);
    if (!node) { return; }
    this.calculateRemainingCosts();
  }

  initializeNode(node: INode, direction: number, level: number): void {
    // Save item guid to detect updates
    if (node.item) { this.itemMap.set(node.item.guid, node); }

    this.nodes.push(node);
    const arr = direction < 0 ? this.left : direction > 0 ? this.right : this.center;
    arr[level] = node;

    // Add costs to total
    if (node.c) { this.totalCost.c! += node.c };
    if (node.h) { this.totalCost.h! += node.h };
    if (node.sc) { this.totalCost.sc! += node.sc };
    if (node.sh) { this.totalCost.sh! += node.sh };
    if (node.ac) { this.totalCost.ac! += node.ac };

    if (node.nw) { this.initializeNode(node.nw, direction -1, level); }
    if (node.ne) { this.initializeNode(node.ne, direction + 1, level); }
    if (node.n) { this.initializeNode(node.n, direction, level + 1); }
  }

  calculateRemainingCosts(): void {
    this.remainingCost = {};
    this.nodes.filter(n => !n.unlocked && !n.item?.unlocked).forEach(n => {
      CostHelper.add(this.remainingCost, n);
    });
  }

  unlockAll(): void {
    const itemNodes = this.nodes.filter(n => n.item);
    const items: Array<IItem> = itemNodes.map(n => n.item!);
    const shouldUnlock = items.filter(v => !v.unlocked).length;

    const msg = `Are you sure you want to ${shouldUnlock?'UNLOCK':'REMOVE'} all items from this tree?`;
    if (!confirm(msg)) { return; }

    if (shouldUnlock) {
      // Unlock all locked items.
      itemNodes.filter(n => !n.item!.unlocked).forEach(node => {
        node.item!.unlocked = true;
        node.unlocked = true;

        this._storageService.add(node.item!.guid, node.guid);
        this._eventService.toggleItem(node.item!);
      });
    } else {
      // Lock all unlocked items.
      itemNodes.filter(n => n.item!.unlocked).forEach(node => {
        node.item!.unlocked = false;
        const refNodes = node.item!.nodes || [];
        refNodes.forEach(n => n.unlocked = false);

        this._storageService.remove(node.item!.guid, ...refNodes.map(n => n.guid));
        this._eventService.toggleItem(node.item!);
      });
    }

    this._storageService.save();
  }
}
