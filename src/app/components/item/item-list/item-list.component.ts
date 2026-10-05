import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { CostHelper } from '@app/helpers/cost-helper';
import { CurrencyService } from '@app/services/currency.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { IItemList, IItemListNode } from 'skygame-data';
import { SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';

export interface ItemListNodeClickEvent {
  node: IItemListNode;
  event: MouseEvent;
  prevent: () => void;
}

interface NodeCost {
  icon: string;
  amount: number;
  kind: 'currency' | 'seasonal';
}

interface RenderNode {
  node: IItemListNode;
  unlocked: boolean;
  highlighted: boolean;
  cost?: NodeCost;
}

/**
 * Item list (shop-style).
 *
 * Each node renders as an item link plus a cost bar: clicking the icon
 * navigates to the item page (so middle- / ctrl-click open a new tab natively),
 * while clicking the cost bar toggles the unlock and adjusts the shop's
 * currency. `(nodeClick)` fires before a toggle and can `prevent()` it.
 */
@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon, ItemIconComponent, RouterLink, NgTemplateOutlet]
})
export class ItemListComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly itemList = input.required<IItemList>();
  readonly highlightNode = input<string | undefined>(undefined);
  readonly opaqueNodes = input<boolean>(false);
  /** Overlay rendered on top of every node, with the node as implicit context. */
  readonly nodeOverlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  readonly nodeClick = output<ItemListNodeClickEvent>();

  private readonly _currencyService = inject(CurrencyService);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);

  /** Bumped on `itemToggled` so the in-place unlock mutations re-render. */
  private readonly _refresh = signal(0);

  constructor() {
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => {
      this._refresh.update(v => v + 1);
    });
  }

  readonly nodes = computed<ReadonlyArray<RenderNode>>(() => {
    this._refresh();
    const highlight = this.highlightNode();
    return (this.itemList().items ?? []).map(node => ({
      node,
      unlocked: !!(node.unlocked || node.item?.unlocked),
      highlighted: node.guid === highlight,
      cost: this.costFor(node)
    }));
  });

  onNodeClick(event: MouseEvent, node: IItemListNode): void {
    if (!node.item) { return; }
    event.preventDefault();
    event.stopPropagation();

    let prevented = false;
    this.nodeClick.emit({ node, event, prevent: () => { prevented = true; } });
    if (prevented) { return; }

    node.item.unlocked ? this.lockItem(node) : this.unlockItem(node);
    this._eventService.itemToggled.next(node.item);
  }

  private costFor(node: IItemListNode): NodeCost | undefined {
    if (node.h) { return { icon: 'heart', amount: node.h, kind: 'currency' }; }
    if (node.sc) { return { icon: 'season-candle', amount: node.sc, kind: 'seasonal' }; }
    if (node.sh) { return { icon: 'heart', amount: node.sh, kind: 'seasonal' }; }
    if (node.ac) { return { icon: 'ascended-candle', amount: node.ac, kind: 'currency' }; }
    if (node.ec) { return { icon: 'ticket', amount: node.ec, kind: 'currency' }; }
    if (node.c) { return { icon: 'candle', amount: node.c, kind: 'currency' }; }
    return undefined;
  }

  private unlockItem(node: IItemListNode): void {
    const item = node.item;
    if (!item) { return; }

    node.unlocked = true;
    item.unlocked = true;
    this._storageService.addUnlocked(node.guid, item.guid);

    // Refund the node's cost back into the shop's currency budget.
    const cost = CostHelper.create();
    CostHelper.add(cost, node);
    CostHelper.invert(cost);
    this._currencyService.addCost(cost, node.itemList?.shop?.season, node.itemList?.shop?.event);
  }

  private lockItem(node: IItemListNode): void {
    const item = node.item;
    if (!item) { return; }

    const lockSelf = !!node.unlocked;
    const guids: Array<string> = [item.guid];
    item.unlocked = false;

    // The item may be obtainable from several places; none of them stay unlocked.
    for (const n of [...(item.nodes ?? []), ...(item.hiddenNodes ?? []), ...(item.listNodes ?? [])]) {
      n.unlocked = false;
      guids.push(n.guid);
    }

    this._storageService.removeUnlocked(...guids);

    // Only this node's cost was ever charged to this shop.
    if (lockSelf) {
      this._currencyService.addCost(node, node.itemList?.shop?.season, node.itemList?.shop?.event);
    }
  }
}
