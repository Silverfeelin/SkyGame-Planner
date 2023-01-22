import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IConstellation } from 'src/app/interfaces/constellation.interface';
import { INode } from 'src/app/interfaces/node.interface';

@Component({
  selector: 'app-constellation',
  templateUrl: './constellation.component.html',
  styleUrls: ['./constellation.component.less']
})
export class ConstellationComponent implements OnInit, OnChanges {
  @Input() constellation!: IConstellation;

  left: Array<INode> = [];
  center: Array<INode> = [];
  right: Array<INode> = [];

  constructor() {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['constellation']) {
      this.workOutThoseNodes();
    }
  }

  /** Build grid from nodes. */
  workOutThoseNodes(): void {
    this.left = []; this.center = []; this.right = [];
    if (!this.constellation) { return; }
    this.workOutThatNode(this.constellation.node, 0, 0);
  }

  workOutThatNode(node: INode, direction: number, level: number): void {
    const arr = direction < 0 ? this.left : direction > 0 ? this.right : this.center;
    arr[level] = node;

    if (node.nw) { this.workOutThatNode(node.nw, -1, level); }
    if (node.ne) { this.workOutThatNode(node.ne, 1, level); }
    if (node.n) { this.workOutThatNode(node.n, 0, level + 1); }
  }
}
