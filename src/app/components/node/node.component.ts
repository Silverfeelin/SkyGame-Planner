import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationHelper } from 'src/app/helpers/navigation-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { INode } from 'src/app/interfaces/node.interface';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { NodeService } from 'src/app/services/node.service';
import { StorageService } from 'src/app/services/storage.service';
import { HighlightType } from 'src/app/types/highlight';

export type NodeAction = 'unlock' | 'find' | 'favourite';

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
    private readonly _eventService: EventService,
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
      case 'favourite': return this.toggleFavourite(event);
    }
  }

  toggleFavourite(event: MouseEvent): void {
    if (!this.node.item) { return; }
    if (this.tryCopyDebug(event, this.node)) { return; }
    const item = this.node.item;

    // Toggle favourite status.
    item.favourited = !item.favourited;
    item.favourited ? this._storageService.addFavourites(item.guid) : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }

  toggleNode(event: MouseEvent): void {
    if (!this.node.item) { return; }
    if (this.tryCopyDebug(event, this.node)) { return; }
    const item = this.node.item;

    // Unlock (or lock) based on the item status.
    const unlock = !item.unlocked;
    let toggleConnected = this._storageService.getKey('tree.unlock-connected') !== '0';
    // Don't lock connected nodes if this isn't the unlocked node for the item.
    if (!unlock && !this.node.unlocked) { toggleConnected = false; }

    // Save progress.
    if (unlock) {
      const nodesToUnlock = toggleConnected ? NodeHelper.trace(this.node) : [this.node];

      for (const node of nodesToUnlock) {
        if (node.item && !node.item.unlocked) {
          this._nodeService.unlock(node);
        }
      }
    } else {
      const nodesToLock = toggleConnected ? NodeHelper.all(this.node) : [this.node];

      for (const node of nodesToLock) {
        if (node === this.node || node.unlocked) {
          this._nodeService.lock(node);
        }
      }
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

  tryCopyDebug(event: Event, node: INode): boolean {
    if (!this._debug.copyNode) { return false; }
    event.stopImmediatePropagation();
    event.preventDefault();
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
    return true;
  }
}
