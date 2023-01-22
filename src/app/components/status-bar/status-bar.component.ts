import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { INode } from 'src/app/interfaces/node.interface';
import { SelectionService } from 'src/app/services/selection.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit, OnDestroy {
  node?: INode;
  private readonly _subscriptions: Array<SubscriptionLike> = [];

  constructor(
    private readonly _selectionService: SelectionService
  ) {

  }

  ngOnInit(): void {
    this._subscriptions.push(this._selectionService.nodeChanged.subscribe(n => this.nodeChanged(n)))
  }

  nodeChanged(node?: INode): void {
    this.node = node;
  }

  private calculateCost(node: INode): void {

  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions.length = 0;
  }
}
