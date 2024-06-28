import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, Input, OnChanges, OnDestroy, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { filter, SubscriptionLike } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ISpiritTree } from 'src/app/interfaces/spirit-tree.interface';
import { ICost } from 'src/app/interfaces/cost.interface';
import { IItem } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { NodeAction, NodeComponent } from '../node/node.component';
import { DateTime } from 'luxon';
import { CostComponent } from '../util/cost/cost.component';
import { DateComponent } from '../util/date/date.component';
import { NgFor, NgTemplateOutlet } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';
import { DebugService } from '@app/services/debug.service';

const signalAction = signal<NodeAction>('unlock');

@Component({
    selector: 'app-spirit-tree',
    templateUrl: './spirit-tree.component.html',
    styleUrls: ['./spirit-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIcon, NgbTooltip, NgFor, NgTemplateOutlet, DateComponent, CostComponent, NodeComponent]
})
export class SpiritTreeComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() tree!: ISpiritTree;
  @Input() name?: string | undefined;
  @Input() highlight?: boolean;
  @Input() highlightItem?: string;
  @Input() seasonIcon?: string;
  @Input() enableControls = true;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;
  @Input() opaqueNodes?: boolean;
  @Input() padBottom = false;

  nodes: Array<INode> = [];
  left: Array<INode> = [];
  center: Array<INode> = [];
  right: Array<INode> = [];
  hiddenItems: { [itemGuid: string]: INode } = {};

  hasCostAtRoot = false;
  toggleUnlock = false;

  showingNodeActions = false;
  nodeAction: NodeAction = 'unlock';

  itemMap = new Map<string, INode>();
  hasCost!: boolean;
  totalCost!: ICost;
  remainingCost!: ICost;

  tsDate?: DateTime;
  rsDate?: DateTime;

  _itemSub?: SubscriptionLike;

  constructor(
    private readonly _debugService: DebugService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    effect(() => {
      this.nodeAction = signalAction();
      _changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    const element = this._elementRef.nativeElement as HTMLElement;
    const scrollElem = element.querySelector('.spirit-tree-scroll');
    if (scrollElem) { scrollElem.scrollTop = 1000; }

    document.addEventListener('click', this.hideNodeActions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tree']) {
      this.initializeNodes();
      this.subscribeItemChanged();
      this.calculateRemainingCosts();

      this.tsDate = this.tree.ts?.date;
      this.rsDate = this.tree.visit?.return?.date;
    }

  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
    document.removeEventListener('click', this.hideNodeActions);
  }

  hideNodeActions = (): void => {
    this.showingNodeActions = false;
    this._changeDetectorRef.markForCheck();
  }

  setNodeAction(evt: MouseEvent, action: NodeAction): void {
    evt.stopPropagation();
    if (this.showingNodeActions) {
      signalAction.set(action);
      this.showingNodeActions = false;
    } else {
      this.showingNodeActions = true;
    }
  }

  /** Build grid from nodes. */
  initializeNodes(): void {
    // Reset data
    this.itemMap.clear();
    this.totalCost = CostHelper.create();
    this.remainingCost = CostHelper.create();
    this.nodes = []; this.left = []; this.center = []; this.right = [];
    this.hasCost = false;

    if (!this.tree) { return; }
    this.initializeNode(this.tree.node, 0, 0);
    this.hasCost = !CostHelper.isEmpty(this.totalCost);
    this.hasCostAtRoot = !CostHelper.isEmpty(this.tree.node);
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
    this._changeDetectorRef.markForCheck();
  }

  initializeNode(node: INode, direction: number, level: number): void {
    // Save item guid to detect updates
    if (node.item) { this.itemMap.set(node.item.guid, node); }

    this.nodes.push(node);
    const arr = direction < 0 ? this.left : direction > 0 ? this.right : this.center;
    arr[level] = node;

    // Add costs to total
    CostHelper.add(this.totalCost, node);

    if (node.nw) { this.initializeNode(node.nw, direction -1, level); }
    if (node.ne) { this.initializeNode(node.ne, direction + 1, level); }
    if (node.n) { this.initializeNode(node.n, direction, level + 1); }

    // Store hidden items for highlighting.
    if (node.hiddenItems?.length) {
      node.hiddenItems.forEach(item => this.hiddenItems[item.guid] = node);
    }
  }

  calculateRemainingCosts(): void {
    this.remainingCost = CostHelper.create();
    this.toggleUnlock = this.nodes.some(n => n.item && !n.item.unlocked);
    this.nodes.filter(n => !n.unlocked && !n.item?.unlocked).forEach(n => {
      CostHelper.add(this.remainingCost, n);
    });
  }

  unlockAll(): void {
    if (this._debugService.copyTree) {
      navigator.clipboard.writeText(this.tree?.guid || '');
      return;
    }
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

        this._storageService.addUnlocked(node.item!.guid);
        this._storageService.addUnlocked(node.guid);
        this._eventService.itemToggled.next(node.item!);
      });
    } else {
      // Lock all unlocked items.
      itemNodes.filter(n => n.item!.unlocked).forEach(node => {
        node.item!.unlocked = false;
        const refNodes = node.item!.nodes || [];
        refNodes.forEach(n => n.unlocked = false);

        this._storageService.removeUnlocked(node.item!.guid);
        this._storageService.removeUnlocked(...refNodes.map(n => n.guid));
        this._eventService.itemToggled.next(node.item!);
      });
    }
  }
}
