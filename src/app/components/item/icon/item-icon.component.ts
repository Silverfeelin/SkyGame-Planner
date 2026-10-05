import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { ItemSubIconsComponent, ItemSubicon } from './subicons/item-subicons.component';
import { IconComponent } from '../../icon/icon.component';
import { IItem, INode, IIAP, IItemListNode, ItemSize } from 'skygame-data';

@Component({
    selector: 'app-item-icon',
    templateUrl: './item-icon.component.html',
    styleUrl: './item-icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IconComponent, ItemSubIconsComponent]
})
export class ItemIconComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item!: IItem;
  @Input() node?: INode;
  @Input() iap?: IIAP;
  @Input() listNode?: IItemListNode;
  @Input() size: ItemSize = 'default';
  @Input() subIcons: ReadonlyArray<ItemSubicon> = [];
  @Input() lazy = true;

  /** Forces icon to be opaque instead of checking if it's unlocked. */
  @Input() opaque?: boolean;

  @HostBinding('attr.data-size')
  _size: ItemSize = 'default';

  iconWidth = '64px';
  iconHeight = '64px';
  subIconSize = 20;

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
    if (changes['size']) {
      this._size = changes['size'].currentValue;
      switch (this._size) {
        case 'mini': this.iconWidth = this.iconHeight = '24px'; this.subIconSize = 13; break;
        case 'small': this.iconWidth = this.iconHeight = '32px'; this.subIconSize = 13; break;
        case 'medium': this.iconWidth = this.iconHeight = '48px'; this.subIconSize = 18; break;
        case 'large': this.iconWidth = this.iconHeight = '96px'; this.subIconSize = 24; break;
        default: this.iconWidth = this.iconHeight = '64px'; this.subIconSize = 20; break;
      }
    }
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
