import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { IItemList, IItemListNode } from 'skygame-data';

export interface AtmosItemListNodeClickEvent {
  node: IItemListNode;
  event: MouseEvent;
  prevent: () => void;
}

interface NodeCost {
  icon: string;
  amount: number;
  kind: 'currency' | 'seasonal';
}

/**
 * Atmospheric item list (shop-style). Mirrors the legacy `ItemListComponent`
 * surface. Click handling is bubbled up via `(nodeClick)` — the parent owns
 * unlock/lock and currency side-effects.
 */
@Component({
  selector: 'app-atmos-item-list',
  templateUrl: './atmos-item-list.component.html',
  styleUrl: './atmos-item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent]
})
export class AtmosItemListComponent {
  readonly itemList = input.required<IItemList>();
  readonly highlightNode = input<string | undefined>(undefined);
  readonly opaqueNodes = input<boolean>(false);

  readonly nodeClick = output<AtmosItemListNodeClickEvent>();

  readonly nodes = computed<ReadonlyArray<IItemListNode>>(() => this.itemList().items ?? []);

  costFor(node: IItemListNode): NodeCost | undefined {
    if (node.h) { return { icon: 'heart', amount: node.h, kind: 'currency' }; }
    if (node.sc) { return { icon: 'season-candle', amount: node.sc, kind: 'seasonal' }; }
    if (node.sh) { return { icon: 'heart', amount: node.sh, kind: 'seasonal' }; }
    if (node.ac) { return { icon: 'ascended-candle', amount: node.ac, kind: 'currency' }; }
    if (node.ec) { return { icon: 'ticket', amount: node.ec, kind: 'currency' }; }
    if (node.c) { return { icon: 'candle', amount: node.c, kind: 'currency' }; }
    return undefined;
  }

  isHighlighted(node: IItemListNode): boolean {
    return this.highlightNode() === node.guid;
  }

  onNodeClick(event: MouseEvent, node: IItemListNode): void {
    let prevented = false;
    this.nodeClick.emit({ node, event, prevent: () => { prevented = true; } });
    if (prevented) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
