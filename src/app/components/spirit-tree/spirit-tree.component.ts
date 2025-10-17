import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { filter, SubscriptionLike } from 'rxjs';
import { CostHelper } from 'src/app/helpers/cost-helper';
import { ISpiritTree, ISpiritTreeTier } from 'src/app/interfaces/spirit-tree.interface';
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
import { CurrencyService } from '@app/services/currency.service';
import { IconService } from '@app/services/icon.service';
import { DataService } from '@app/services/data.service';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';
import { Router } from '@angular/router';
import { cancellableEvent, noInputs } from '@app/rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreeHelper } from '@app/helpers/tree-helper';

export type SpiritTreeNodeClickEvent = { node: INode, event: MouseEvent };
const signalAction = signal<NodeAction>('unlock');

type ShareMode = 'share' | 'clipboard';

@Component({
    selector: 'app-spirit-tree',
    templateUrl: './spirit-tree.component.html',
    styleUrls: ['./spirit-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon, NgbTooltip, NgFor, NgTemplateOutlet, DateComponent, CostComponent, NodeComponent]
})
export class SpiritTreeComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() tree!: ISpiritTree;
  @Input() name?: string | undefined;
  @Input() highlight?: boolean;
  @Input() highlightItem?: string | Array<string>;
  @Input() highlightNode?: string | Array<string>;
  @Input() enableControls = true;
  @Input() showNodeTooltips = true;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;
  @Input() opaqueNodes?: boolean | Array<string>;
  @Input() padBottom = false;
  @Input() forceNodeAction?: NodeAction;

  @Output() readonly nodeClicked = new EventEmitter<SpiritTreeNodeClickEvent>();

  hasNodes = false;
  hasTiers = false;
  nodes: Array<INode> = [];
  left: Array<INode> = [];
  center: Array<INode> = [];
  right: Array<INode> = [];
  tiers?: Array<ISpiritTreeTier>;
  opaqueNodesAll: boolean = false;
  opaqueNodesMap: { [guid: string]: boolean } = {};
  highlightItemMap: { [guid: string]: boolean } = {};
  highlightNodeMap: { [guid: string]: boolean } = {};

  hasCostAtRoot = false;
  toggleUnlock = false;

  showingMenuActions = false;
  showingNodeActions = false;
  nodeAction: NodeAction = 'unlock';
  visibleName?: string;

  itemMap = new Map<string, INode>();
  hasCost!: boolean;
  totalCost!: ICost;
  remainingCost!: ICost;

  tsDate?: DateTime;
  rsDate?: DateTime;

  _itemSub?: SubscriptionLike;

  constructor(
    private readonly _debugService: DebugService,
    private readonly _currencyService: CurrencyService,
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _iconService: IconService,
    private readonly _spiritTreeRenderService: SpiritTreeRenderService,
    private readonly _storageService: StorageService,
    private readonly _elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _router: Router
  ) {
    effect(() => {
      this.nodeAction = signalAction();
      _changeDetectorRef.markForCheck();
    });

    _eventService.keydown.pipe(takeUntilDestroyed(), cancellableEvent(), noInputs()).subscribe(evt => {
      if (this.forceNodeAction || !this.enableControls) { return; }
      if (evt.shiftKey || evt.ctrlKey || evt.altKey || evt.metaKey) { return; }

      let action: NodeAction | undefined;
      switch (evt.key?.toLocaleLowerCase()) {
        case 'f': action = 'favourite'; break;
        case 'n': action = 'navigate'; break;
        case 'u': action = 'unlock'; break;
        default: return;
      }

      if (this.nodeAction === action) { action = 'unlock'; }
      signalAction.set(action);

      evt.preventDefault();
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

    if (changes['opaqueNodes']) {
      this.opaqueNodesAll = false;
      this.opaqueNodesMap = {};
      if (this.opaqueNodes) {
        this.opaqueNodesAll = this.opaqueNodes === true;
        typeof this.opaqueNodes === 'object' && this.opaqueNodes.forEach(guid => this.opaqueNodesMap[guid] = true);
      }
    }

    if (changes['highlightItem']) {
      this.highlightItemMap = {};
      if (this.highlightItem) {
        if (typeof this.highlightItem === 'string') {
          this.highlightItemMap[this.highlightItem] = true;
        } else {
          this.highlightItem.forEach(guid => this.highlightItemMap[guid] = true);
        }
      }
    }

    if (changes['highlightNode']) {
      this.highlightNodeMap = {};
      if (this.highlightNode) {
        if (typeof this.highlightNode === 'string') {
          this.highlightNodeMap[this.highlightNode] = true;
        } else {
          this.highlightNode.forEach(guid => this.highlightNodeMap[guid] = true);
        }
      }
    }


    this.updateName();
  }

  ngOnDestroy(): void {
    this._itemSub?.unsubscribe();
    document.removeEventListener('click', this.hideNodeActions);
  }

  onNodeClicked(event: MouseEvent, node: INode): void {
    this.nodeClicked.emit({ node, event: event });
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
    this.tiers = undefined;
    this.hasCost = false;

    this.hasNodes = !!(this.tree && this.tree.node);
    this.hasTiers = !!(this.tree && this.tree.tier);

    if (this.hasNodes) {
      this.initializeNode(this.tree.node!, 0, 0);
      this.hasCost = !CostHelper.isEmpty(this.totalCost);
      this.hasCostAtRoot = !CostHelper.isEmpty(this.tree.node!);
    } else if (this.hasTiers) {
      this.initializeTiers(this.tree);
      this.hasCost = !CostHelper.isEmpty(this.totalCost);
      this.hasCostAtRoot = false;
    }
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
  }

  initializeTiers(tree: ISpiritTree): void {
    let level = -1;
    const tiers = TreeHelper.getTiers(this.tree);
    this.tiers = tiers;
    for (const tier of tiers) {
      for (const row of tier.nodes) {
        level++;
        row.forEach((node, i) => {
          if (!node) { return; }
          this.initializeNode(node, i - 1, level);
        });
      }
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

    const unlockCost = CostHelper.create();
    if (shouldUnlock) {
      // Unlock all locked items.
      itemNodes.filter(n => !n.item!.unlocked).forEach(node => {
        // Track currencies to remove.
        CostHelper.add(unlockCost, node);

        // Unlock item.
        node.item!.unlocked = true;
        node.unlocked = true;

        this._storageService.addUnlocked(node.item!.guid);
        this._storageService.addUnlocked(node.guid);
        this._eventService.itemToggled.next(node.item!);
      });
    } else {
      // Lock all unlocked items.
      itemNodes.filter(n => n.item!.unlocked).forEach(node => {
        // Track currencies to refund.
        node.unlocked && CostHelper.add(unlockCost, node);

        // Lock item and all nodes referencing it.
        node.item!.unlocked = false;
        const refNodes = node.item!.nodes || [];
        refNodes.forEach(n => n.unlocked = false);

        this._storageService.removeUnlocked(node.item!.guid);
        this._storageService.removeUnlocked(...refNodes.map(n => n.guid));
        this._eventService.itemToggled.next(node.item!);
      });
    }

    // When unlocking, invert cost.
    if (shouldUnlock) { CostHelper.invert(unlockCost); }

    // Modify currencies.
    // TODO: this does not track the cost when locking nodes outside of this tree.
    this._currencyService.addTreeCost(unlockCost, this.tree);
  }

  editTree(): void {
    const result = confirm('Do you want to clone this tree as a new tree? [Yes] Clone [No] Modify');
    void this._router.navigate(['/spirit-tree/editor'], { queryParams: { tree: this.tree.guid, modify: !result } });
  }

  async export(mode: ShareMode): Promise<void> {
    if (mode === 'share' && !navigator.share) { alert('Sharing is not supported by this browser.'); return; }
    if (mode === 'clipboard' &&  typeof(ClipboardItem) === 'undefined') { alert('Copying to clipboard is not supported by this browser.'); return; }

    try {
      const spiritName = this.tree?.spirit?.name ?? this.tree?.eventInstanceSpirit?.spirit?.name ?? this.tree?.ts?.spirit?.name ?? this.tree?.visit?.spirit?.name;
      const title = spiritName;
      let subtitle = this.visibleName;
      if (this.tsDate || this.rsDate) {
        subtitle = this.tsDate ? `TS #${this.tree.ts!.number}` : this.rsDate ? `${this.tree.visit!.return.name}` : '';
        subtitle += ` (${(this.tsDate || this.rsDate)!.toFormat('dd-MM-yyyy')})`;
      } else if (subtitle === title || subtitle === 'Spirit tree') { subtitle = undefined; }

      const canvas = await this._spiritTreeRenderService.render(this.tree, {
        title, subtitle,
        background: true
      });

      if (mode === 'share') {
        this._spiritTreeRenderService.shareCanvas(canvas, 'spirit-tree.png');
      } else {
        this._spiritTreeRenderService.copyCanvas(canvas);
      }
    } catch (e: any) {
      alert(`Failed to copy the spirit tree: ${e?.message ?? e}`);
    }
  }


  private updateName(): void {
    this.visibleName = this.name ?? this.tree.name
      ?? this.tree.eventInstanceSpirit?.name ?? this.tree.eventInstanceSpirit?.spirit?.name
      ?? this.tree.ts?.spirit?.name
      ?? this.tree.visit?.spirit?.name
      ?? this.tree.spirit?.name;
  }
}
