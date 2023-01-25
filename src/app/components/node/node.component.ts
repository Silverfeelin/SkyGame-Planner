import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { INode } from 'src/app/interfaces/node.interface';
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

  hover?: boolean;
  tooltipPlacement = 'bottom';

  constructor(
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['position']) {
      const pos = changes['position'].currentValue;
      this.tooltipPlacement = pos === 'left' ? 'right' : pos === 'right' ? 'left' : 'bottom';
    }
  }

  mouseEnter(event: MouseEvent): void {
    this.hover = true;
    this._eventService.setHoveredNode(this.node);
  }

  mouseLeave(event: MouseEvent): void {
    this.hover = false;
    this._eventService.setHoveredNode(undefined);
  }

  toggleNode(): void {
    if (!this.node.item) { return; }
    const item = this.node.item;

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
