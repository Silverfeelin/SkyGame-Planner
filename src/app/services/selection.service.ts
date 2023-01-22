import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { INode } from '../interfaces/node.interface';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  node?: INode;

  readonly nodeChanged = new Subject<INode | undefined>();

  constructor() {}

  setSelectedNode(node?: INode): void {
    this.node = node;
    this.nodeChanged.next(this.node);
  }
}
