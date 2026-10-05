import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { MatIcon } from '@angular/material/icon';
import { EventService } from '@app/services/event.service';
import { DebugService } from '@app/services/debug.service';
import { NavigationHelper, INavigationTarget } from '@app/helpers/navigation-helper';
import { INode } from 'skygame-data';
import { ItemSubicon, SUBICONS_ALL } from '@app/components/item/icon/subicons/item-subicons.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';

export type NodeAction = 'emit' | 'unlock' | 'navigate' | 'favourite';
export type NodePosition = 'left' | 'center' | 'right';

/**
 * Node tile inside a spirit tree. Click handling is delegated to the parent
 * (`SpiritTreeComponent` is responsible for unlock / lock / navigate
 * semantics).
 *
 * Rendered as an `<a href>` to the item page so middle-click / ctrl-click
 * open the item in a new tab natively, while a plain left-click is intercepted
 * and handed to the parent's action pipeline.
 */
@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Expose the node GUID as a DOM attribute so consumers (e.g. the spirit-tree
  // editor's drag-to-swap) can hit-test nodes via `elementsFromPoint`.
  host: { '[attr.guid]': 'node().guid' },
  imports: [TooltipDirective, ItemIconComponent, MatIcon, NgTemplateOutlet]
})
export class NodeComponent {
  readonly node = input.required<INode>();
  readonly subIcons = input<ReadonlyArray<ItemSubicon>>(SUBICONS_ALL);
  readonly position = input<NodePosition>('center');
  readonly highlight = input<boolean>(false);
  readonly action = input<NodeAction>('unlock');
  readonly opaque = input<boolean>(false);
  readonly showTooltips = input<boolean>(true);
  readonly overlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  readonly drawConnectors = input<boolean>(true);

  readonly nodeClicked = output<MouseEvent>();

  private readonly _debug = inject(DebugService);
  private readonly _router = inject(Router);

  /** Bumped on `itemToggled` so the in-place unlock mutation re-renders this tile. */
  private readonly _refresh = signal(0);

  constructor() {
    const eventService = inject(EventService);
    eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(item => {
      if (item.guid !== this.node().item?.guid) { return; }
      this._refresh.update(v => v + 1);
    });
  }

  /** Item-page link used for the anchor `href` (native middle/ctrl-click open). */
  readonly link = computed<INavigationTarget | undefined>(() => {
    const item = this.node().item;
    return item ? NavigationHelper.getItemLink(item) : undefined;
  });

  /** Item-page href; absent in emit mode, where the tile is a selection target only. */
  readonly href = computed<string | null>(() => {
    if (this.action() === 'emit') { return null; }
    const link = this.link();
    return link ? this._router.serializeUrl(this._router.createUrlTree(link.route, link.extras)) : null;
  });

  readonly unlocked = computed<boolean>(() => {
    this._refresh();
    return !!(this.node().unlocked || this.node().item?.unlocked);
  });

  readonly cost = computed<{ icon: string; amount: number; kind: string } | undefined>(() => {
    const n = this.node();
    if (n.h) { return { icon: 'heart', amount: n.h, kind: 'currency' }; }
    if (n.sc) { return { icon: 'season-candle', amount: n.sc, kind: 'seasonal' }; }
    if (n.sh) { return { icon: 'heart', amount: n.sh, kind: 'seasonal' }; }
    if (n.ac) { return { icon: 'ascended-candle', amount: n.ac, kind: 'currency' }; }
    if (n.ec) { return { icon: 'ticket', amount: n.ec, kind: 'currency' }; }
    if (n.c) { return { icon: 'candle', amount: n.c, kind: 'currency' }; }
    return undefined;
  });

  onClick(event: MouseEvent): void {
    // Debug helper: copy node GUID to clipboard instead of acting.
    if (this._debug.copyNode) {
      event.preventDefault();
      event.stopImmediatePropagation();
      void navigator.clipboard.writeText(this.node().guid);
      return;
    }

    // Let the browser handle modifier / middle clicks (open item in new tab).
    if (event.ctrlKey || event.shiftKey || event.metaKey || event.button === 1) { return; }

    event.preventDefault();
    this.nodeClicked.emit(event);
  }
}
