import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit, OnDestroy {
  @Input() item!: IItem;
  @HostBinding('class.large')
  @Input() large = false;
  @Input() highlight?: boolean;
  @HostBinding('class.hoverable')
  @Input() hoverHighlight = true;
  @Input() showSubIcons?: boolean;

  ItemType = ItemType;

  _sub?: SubscriptionLike;

  constructor(
    private readonly _debug: DebugService,
    private readonly _eventService: EventService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {

  }
  ngOnInit(): void {
    this._sub = this._eventService.itemToggled.subscribe(item => {
      if (item.guid !== this.item?.guid) { return; }
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  iconClick(event: MouseEvent): void {
    if (!this._debug.copyItem) { return; }
    event.stopImmediatePropagation();
    event.preventDefault();
    navigator.clipboard.writeText(this.item.guid);
  }
}
