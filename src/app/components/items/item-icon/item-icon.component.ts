import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IItem, ItemSize, ItemSubicon, ItemType } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { HighlightType } from 'src/app/types/highlight';
import { ItemSubIconsComponent } from './item-subicons/item-subicons.component';
import { IconComponent } from '../../icon/icon.component';
import { NgIf } from '@angular/common';
import { IItemListNode } from '@app/interfaces/item-list.interface';

@Component({
    selector: 'app-item-icon',
    templateUrl: './item-icon.component.html',
    styleUrls: ['./item-icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, IconComponent, ItemSubIconsComponent]
})
export class ItemIconComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item!: IItem;
  @Input() node?: INode;
  @Input() iap?: IIAP;
  @Input() listNode?: IItemListNode;
  @Input() size: ItemSize = 'default';
  @Input() subIcons: Array<ItemSubicon> = [];
  @Input() lazy = true;

  /** Forces icon to be opaque instead of checking if it's unlocked. */
  @Input() opaque?: boolean;

  @HostBinding('class.hoverable')
  @Input() hoverGlow = true;
  /** Type of highlight border */
  @Input() glowType?: HighlightType = 'default';

  @HostBinding('attr.data-size')
  _size: ItemSize = 'default';

  iconWidth = '64px';
  iconHeight = '64px';

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
        case 'mini': this.iconWidth = this.iconHeight = '24px'; break;
        case 'small': this.iconWidth = this.iconHeight = '32px'; break;
        case 'medium': this.iconWidth = this.iconHeight = '48px'; break;
        case 'large': this.iconWidth = this.iconHeight = '96px'; break;
        default: this.iconWidth = this.iconHeight = '64px'; break;
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
