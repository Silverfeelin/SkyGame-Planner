import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SubscriptionBag } from 'src/app/helpers/subscription-bag';
import { IIAP } from 'src/app/interfaces/iap.interface';
import { IItem, ItemSubicon } from 'src/app/interfaces/item.interface';
import { INode } from 'src/app/interfaces/node.interface';
import { EventService } from 'src/app/services/event.service';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { IconComponent } from '../../../icon/icon.component';
import { IItemListNode } from '@app/interfaces/item-list.interface';

@Component({
    selector: 'app-item-subicons',
    templateUrl: './item-subicons.component.html',
    styleUrls: ['./item-subicons.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [IconComponent, NgbTooltip, MatIcon]
})
export class ItemSubIconsComponent implements OnChanges, OnDestroy {
  @Input() item?: IItem;
  @Input() node?: INode;
  @Input() iap?: IIAP;
  @Input() listNode?: IItemListNode;
  @Input() icons?: Array<ItemSubicon>;

  @HostBinding('class.show-tooltips')
  @Input() showTooltips = false;

  iconsShown: { [key: string]: boolean } = {};

  private readonly _subs = new SubscriptionBag();

  constructor(
    _eventService: EventService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    this._subs.add(_eventService.itemFavourited.subscribe(item => {
      if (item !== this.item) { return; }
      _changeDetectorRef.markForCheck();
    }));

    this._subs.add(_eventService.itemToggled.subscribe(item => {
      if (item !== this.item) { return; }
      _changeDetectorRef.markForCheck();
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['icons']) { this.updateIconsShown(); }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  private updateIconsShown(): void {
    this.iconsShown = this.icons?.reduce((acc: { [key: string]: boolean }, icon: ItemSubicon) => {
      return (acc[icon] = true) && acc;
    }, {}) || {};
  }
}
