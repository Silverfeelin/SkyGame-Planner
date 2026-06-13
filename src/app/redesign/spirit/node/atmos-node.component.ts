import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { MatIcon } from '@angular/material/icon';
import { EventService } from '@app/services/event.service';
import { DebugService } from '@app/services/debug.service';
import { NavigationHelper, INavigationTarget } from '@app/helpers/navigation-helper';
import { HighlightType } from '@app/types/highlight';
import { INode } from 'skygame-data';

export type AtmosNodeAction = 'emit' | 'unlock' | 'navigate';
export type AtmosNodePosition = 'left' | 'center' | 'right';

/**
 * Atmospheric node tile inside a spirit tree. Mirrors the legacy
 * `NodeComponent` input surface; click handling is delegated to the parent
 * (`AtmosSpiritTreeComponent` is responsible for unlock / lock / navigate
 * semantics).
 *
 * Rendered as an `<a routerLink>` to the item page so middle-click / ctrl-click
 * open the item in a new tab natively, while a plain left-click is intercepted
 * and handed to the parent's action pipeline.
 */
@Component({
  selector: 'app-atmos-node',
  templateUrl: './atmos-node.component.html',
  styleUrl: './atmos-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemIconComponent, MatIcon, NgTemplateOutlet, RouterLink]
})
export class AtmosNodeComponent {
  readonly node = input.required<INode>();
  readonly position = input<AtmosNodePosition>('center');
  readonly highlight = input<boolean>(false);
  readonly action = input<AtmosNodeAction>('unlock');
  readonly enableNavigation = input<boolean>(true);
  readonly opaque = input<boolean>(false);
  readonly showTooltips = input<boolean>(true);
  readonly overlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  readonly drawConnectors = input<boolean>(true);

  readonly nodeClicked = output<MouseEvent>();

  private readonly _debug = inject(DebugService);

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

  /** Highlight border style; "attention" draws the eye in navigate mode. */
  readonly glowType = computed<HighlightType>(() => this.action() === 'navigate' ? 'attention' : 'default');

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

    this.nodeClicked.emit(event);
  }
}
