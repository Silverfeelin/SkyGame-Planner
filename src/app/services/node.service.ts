import { Injectable } from '@angular/core';
import { INode } from '../interfaces/node.interface';
import { StorageService } from './storage.service';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService
  ) { }

  unlock(node: INode): boolean {
    if (!node?.item) { return false; }
    const guids: Array<string> = [];

    // Unlock the item.
    node.item.unlocked = true;
    guids.push(node.item.guid);

    // Unlock the node to track costs. Other nodes are not unlocked but will appear unlocked by the item status.
    node.unlocked = true;
    guids.push(node.guid);

    // Unlock hidden items.
    node.hiddenItems?.forEach(item => {
      item.unlocked = true;
      guids.push(item.guid);
    });

    // Save data.
    for (const guid of guids) {
      this._storageService.addUnlocked(guid);
    }

    // Notify listeners.
    this._eventService.itemToggled.next(node.item);

    return true;
  }

  lock(node: INode): boolean {
    if (!node?.item) { return false; }
    const guids: Array<string> = [];

    // Get all associated items.
    const hiddenItems = node.hiddenItems || [];
    const items = [node.item, ...hiddenItems];

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

      // Remove unlock from item list nodes that contain this item.
      const listNodes = item.listNodes || [];
      listNodes.forEach(n => { n.unlocked = false; guids.push(n.guid); });
    }

    // Save data.
    for (const guid of guids) {
      this._storageService.removeUnlocked(guid);
    }

    // Notify listeners.
    this._eventService.itemToggled.next(node.item);

    return true;
  }
}
