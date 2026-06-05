import { ChangeDetectionStrategy, Component, computed, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { MatIcon } from '@angular/material/icon';
import { INode } from 'skygame-data';

export type AtmosNodeAction = 'emit' | 'unlock' | 'navigate' | 'favourite';
export type AtmosNodePosition = 'left' | 'center' | 'right';

/**
 * Atmospheric node tile inside a spirit tree. Mirrors the legacy
 * `NodeComponent` input surface; click handling is delegated to the parent
 * (`AtmosSpiritTreeComponent` is responsible for unlock / lock / navigate
 * semantics).
 */
@Component({
  selector: 'app-atmos-node',
  templateUrl: './atmos-node.component.html',
  styleUrl: './atmos-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemIconComponent, MatIcon, NgTemplateOutlet]
})
export class AtmosNodeComponent {
  readonly node = input.required<INode>();
  readonly position = input<AtmosNodePosition>('center');
  readonly highlight = input<boolean>(false);
  readonly action = input<AtmosNodeAction>('unlock');
  readonly opaque = input<boolean>(false);
  readonly showTooltips = input<boolean>(true);
  readonly overlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  readonly nodeClicked = output<MouseEvent>();

  readonly unlocked = computed<boolean>(() => !!(this.node().unlocked || this.node().item?.unlocked));

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
    this.nodeClicked.emit(event);
  }
}
