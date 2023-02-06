import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.less']
})
export class StatusBarComponent implements OnInit, OnDestroy {
  node?: INode;

  wingBuffs: Array<IItem> = [];
  wingBuffCount = 0;

  private readonly _subscriptions: Array<SubscriptionLike> = [];

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService
  ) {

  }

  ngOnInit(): void {
    this._subscriptions.push(this._eventService.hoverNodeChanged.subscribe(n => this.nodeChanged(n)));
    this._subscriptions.push(this._eventService.itemToggled.subscribe(n => this.itemToggled(n)));

    this.wingBuffs = this._dataService.itemConfig.items.filter(item => item.type === ItemType.WingBuff);
    this.wingBuffCount = this.wingBuffs.filter(w => w.unlocked).length;
  }

  nodeChanged(node?: INode): void {
    this.node = node;
  }

  itemToggled(item: IItem): void {
    if (item.type !== ItemType.WingBuff) { return; }
    this.wingBuffCount = this.wingBuffs.filter(w => w.unlocked).length;
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions.length = 0;
  }
}
