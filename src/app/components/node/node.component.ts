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
    const guids: Array<string> = [];

    // Unlock the item.
    this.node.item.unlocked = true;
    guids.push(this.node.item.guid);

    // Unlock the node to track costs. Other nodes are not unlocked but will appear unlocked by the item status.
    this.node.unlocked = true;
    guids.push(this.node.guid);

    // Unlock hidden items.
    this.node.hiddenItems?.forEach(item => {
      item.unlocked = true;
      guids.push(item.guid);
    });

    // Save data.
    this._storageService.add(...guids);
    this._storageService.save();
  }

  lockItem(): void {
    if (!this.node.item) { return; }
    const guids: Array<string> = [];

    // Get all associated items.
    const hiddenItems = this.node.hiddenItems || [];
    const items = [this.node.item, ...hiddenItems];

    // Remove unlock from items.
    for (const item of items) {
      item.unlocked = false;
      guids.push(item.guid);

      // Remove unlock from all nodes that contain this item.
      const nodes = item.nodes || [];
      nodes.forEach(n => { n.unlocked = false; guids.push(n.guid); });

      // Remove unlock from all hidden nodes that contain this item.
      const hiddenNodes = item.hiddenNodes || [];
      hiddenNodes.forEach(n => { n.unlocked = false; guids.push(n.guid); });
    }

    // Save data.
    this._storageService.remove(...guids);
    this._storageService.save();
  }
}
