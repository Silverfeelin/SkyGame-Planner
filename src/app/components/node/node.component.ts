import { Component, Input } from '@angular/core';
import { INode } from 'src/app/interfaces/node.interface';
import { SelectionService } from 'src/app/services/selection.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.less']
})
export class NodeComponent {
  @Input() node!: INode;

  hover?: boolean;

  /**
   *
   */
  constructor(
    private readonly _selectionService: SelectionService,
    private readonly _storageService: StorageService
  ) {
  }

  mouseEnter(event: MouseEvent): void {
    this.hover = true;
    this._selectionService.setSelectedNode(this.node);
  }

  mouseLeave(event: MouseEvent): void {
    this.hover = false;
    this._selectionService.setSelectedNode(undefined);
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
