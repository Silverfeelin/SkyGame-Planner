import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { INode } from 'src/app/interfaces/node.interface';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.less']
})
export class NodeComponent implements OnChanges {
  @Input() node!: INode;
  @Input() position = 'center';
  @Input() highlight?: boolean;

  hover?: boolean;
  tooltipPlacement = 'bottom';

  constructor(
    private readonly _debug: DebugService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
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
      this.unlockItem();
    } else {
      this.lockItem();
    }

    // Notify listeners.
    this._eventService.toggleItem(item);
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

  unlockItem(): void {
    if (!this.node.item) { return; }

    // Unlock the item.
    this.node.item.unlocked = true;
    // Unlock the node to track costs. Other nodes are not unlocked but will appear unlocked by the item status.
    this.node.unlocked = true;

    // Save data.
    this._storageService.add(this.node.item.guid, this.node.guid);
    this._storageService.save();
  }

  lockItem(): void {
    if (!this.node.item) { return; }

    // Remove unlock from item.
    this.node.item.unlocked = false;
    // Remove unlock from all nodes since the unlocked node might be from a different constellation.
    const nodes = this.node.item.nodes || [];
    nodes.forEach(n => n.unlocked = false);

    // Save data.
    this._storageService.remove(this.node.item.guid, ...nodes?.map(n => n.guid));
    this._storageService.save();
  }
}
