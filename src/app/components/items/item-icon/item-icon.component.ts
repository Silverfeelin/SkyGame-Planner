import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IItem, ItemSize, ItemType } from 'src/app/interfaces/item.interface';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { HighlightType } from 'src/app/types/highlight';

@Component({
  selector: 'app-item-icon',
  templateUrl: './item-icon.component.html',
  styleUrls: ['./item-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemIconComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item!: IItem;
  @Input() size: ItemSize = 'default';
  @Input() showSubIcons?: boolean;

  /** Forces icon to be opaque instead of checking if it's unlocked. */
  @Input() opaque?: boolean;

  @HostBinding('class.hoverable')
  @Input() hoverGlow = true;
  /** Type of highlight border */
  @Input() glowType?: HighlightType = 'default';

  @HostBinding('attr.data-size')
  _size: ItemSize = 'default';

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size']) { this._size = changes['size'].currentValue; }
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
