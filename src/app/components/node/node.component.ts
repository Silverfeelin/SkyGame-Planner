import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationHelper } from 'src/app/helpers/navigation-helper';
import { INode } from 'src/app/interfaces/node.interface';
import { DebugService } from 'src/app/services/debug.service';
import { NodeService } from 'src/app/services/node.service';
import { StorageService } from 'src/app/services/storage.service';
import { HighlightType } from 'src/app/types/highlight';

export type NodeAction = 'unlock' | 'find';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.less']
})
export class NodeComponent implements OnChanges {
  @Input() node!: INode;
  @Input() position = 'center';
  @Input() highlight?: boolean;
  @Input() glowType?: HighlightType = 'default';
  @Input() action: NodeAction = 'unlock';
  @Input() opaque?: boolean;

  hover?: boolean;
  tooltipPlacement = 'bottom';

  constructor(
    private readonly _debug: DebugService,
    private readonly _nodeService: NodeService,
    private readonly _storageService: StorageService,
    private readonly _router: Router
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['position']) {
      const pos = changes['position'].currentValue;
      this.tooltipPlacement = pos === 'left' ? 'bottom-start' : pos === 'right' ? 'bottom-end' : 'bottom';
    }
  }

  mouseEnter(event: MouseEvent): void {
    this.hover = true;
  }

  mouseLeave(event: MouseEvent): void {
    this.hover = false;
  }

  nodeClick(event: MouseEvent): void {
    switch (this.action) {
      case 'unlock': return this.toggleNode(event);
      case 'find': return this.findNode(event);
    }
  }

  toggleNode(event: MouseEvent): void {
    if (!this.node.item) { return; }
    const item = this.node.item;


    if (this._debug.copyNode) {
      event.stopImmediatePropagation();
      event.preventDefault();
      this.copyDebug(this.node);
      return;
    }

    // Unlock (or lock) based on the item status.
    const unlock = !item.unlocked;

    // Save progress.
    if (unlock) {
      this._nodeService.unlock(this.node);

      // Check if prerequisite nodes are unlocked.
      const prerequisite = this.node.prev;
      if (!prerequisite) { return; }
      const unlocked = prerequisite.unlocked;
      if (unlocked) { return; }
      // Ask user to if they want unlock prerequisite node.
      const confirm = window.confirm('Unlock prerequisite node?');
      if (confirm) {
        const prevStack = [prerequisite];
        while (prevStack.length) {
          const prevNode = prevStack.pop();
          if (!prevNode) { continue; }
          this._nodeService.unlock(prevNode);
          if (!prevNode.prev || prevNode.prev.unlocked) { continue; }
          prevStack.push(prevNode.prev);
        }
      }
    } else {
      this._nodeService.lock(this.node);
    }
  }

  findNode(event: MouseEvent): void {
    if (!this.node.item) { return; }
    const item = this.node.item;

    // Find spirit from last appearance of item.
    const target = NavigationHelper.getItemLink(item);
    if (!target) {
      alert('This item does not have a page.');
      return;
    }

    void this._router.navigate(target.route, target.extras);
  }

  copyDebug(node: INode): void {
    const data = {
      nw: !!node.nw,
      n: !!node.n,
      ne: !!node.ne,
      item: node.item?.guid,
      c: node.c,
      h: node.h,
      sc: node.sc,
      sh: node.sh,
      ac: node.ac,
      ec: node.ec,
    };
    navigator.clipboard.writeText(JSON.stringify(data));
  }
}
