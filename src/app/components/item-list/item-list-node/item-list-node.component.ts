import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItemListNode } from 'src/app/interfaces/item-list.interface';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { NgTemplateOutlet, NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '../../items/item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@app/services/currency.service';
import { CostHelper } from '@app/helpers/cost-helper';


export type ItemListNodeClickEvent = {
  node: IItemListNode;
  prevent: () => void;
}

@Component({
    selector: 'app-item-list-node',
    templateUrl: './item-list-node.component.html',
    styleUrl: './item-list-node.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgbTooltip, ItemIconComponent, MatIcon, NgTemplateOutlet, NgIf]
})
export class ItemListNodeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() node!: IItemListNode;
  @Input() highlight?: boolean;
  @Input() opaque?: boolean;
  @Input() nodeOverlayTemplate?: TemplateRef<unknown>;
  @Output() readonly beforeToggle = new EventEmitter<ItemListNodeClickEvent>();

  cost!: number;
  currencyIcon!: string;
  currencyIconClass!: string;

  private _sub?: SubscriptionLike;

  constructor(
    private readonly _currencyService: CurrencyService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._sub = this._eventService.itemToggled.subscribe(item => {
      if (item.guid !== this.node.item?.guid) { return; }
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['node'] && this.updateCurrency();
  }

  nodeClick(event: MouseEvent): void {
    if (!this.node.item) { return; }
    const item = this.node.item;

    let prevented = false;
    const evt: ItemListNodeClickEvent = { node: this.node, prevent: () => prevented = true };
    this.beforeToggle.emit(evt);
    if (prevented) { return; }

    const unlock = !item.unlocked;
    unlock ? this.unlockItem() : this.lockItem();

    this._eventService.itemToggled.next(item);
    this._changeDetectorRef.markForCheck();
    this._changeDetectorRef.detectChanges();
  }

  private updateCurrency(): void {
    this.cost = this.node.c || 0;
    this.currencyIcon = 'candle';
    this.currencyIconClass = 'currency';
    if (this.node.h) { this.cost = this.node.h; this.currencyIcon = 'heart'; this.currencyIconClass = 'currency'; return; }
    if (this.node.sc) { this.cost = this.node.sc; this.currencyIcon = 'candle'; this.currencyIconClass = 'seasonal'; return; }
    if (this.node.sh) { this.cost = this.node.sh; this.currencyIcon = 'heart'; this.currencyIconClass = 'seasonal'; return; }
    if (this.node.ac) { this.cost = this.node.ac; this.currencyIcon = 'ascended-candle'; this.currencyIconClass = 'currency'; return; }
    if (this.node.ec) { this.cost = this.node.ec; this.currencyIcon = 'ticket'; this.currencyIconClass = 'currency'; return; }
  }

  private unlockItem(): void {
    if (!this.node.item) { return; }
    const guids: Array<string> = [];

    // Unlock this node.
    this.node.unlocked = true;
    guids.push(this.node.guid);

    // Unlock the item.
    this.node.item.unlocked = true;
    guids.push(this.node.item.guid);

    // Save data.
    this._storageService.addUnlocked(...guids);

    // Modify currencies.
    // TODO: this does not track the cost when locking other nodes.
    const season = this.node?.itemList?.shop?.season;
    const eventInstance = this.node?.itemList?.shop?.event;
    const cost = CostHelper.create();
    CostHelper.add(cost, this.node);
    CostHelper.invert(cost);
    this._currencyService.addCost(cost, season, eventInstance);
  }

  private lockItem(): void {
    if (!this.node.item) { return; }
    const item = this.node.item;
    const guids: Array<string> = [];

    const lockSelf = this.node.unlocked;
    // Lock the item.
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

    // Save data
    this._storageService.removeUnlocked(...guids);

    // Modify currencies.
    if (lockSelf) {
      const season = this.node?.itemList?.shop?.season;
      const eventInstance = this.node?.itemList?.shop?.event;
      this._currencyService.addCost(this.node, season, eventInstance);
    }
  }
}
