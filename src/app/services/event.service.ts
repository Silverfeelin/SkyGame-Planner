import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IItem } from '../interfaces/item.interface';
import { INode } from '../interfaces/node.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  hoverNode?: INode;

  readonly itemToggled = new Subject<IItem>();
  readonly hoverNodeChanged = new Subject<INode | undefined>();

  constructor() {}

  setHoveredNode(node?: INode): void {
    this.hoverNode = node;
    this.hoverNodeChanged.next(this.hoverNode);
  }

  toggleItem(item: IItem): void {
    this.itemToggled.next(item);
  }
}
